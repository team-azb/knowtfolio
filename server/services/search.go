package services

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/smithy-go"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/search/server"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/search"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
	"strings"
)

type searchService struct {
	DB             *gorm.DB
	Contract       *ethereum.ContractClient
	DynamoDBClient *aws.DynamoDBClient
}

func NewSearchService(db *gorm.DB, contract *ethereum.ContractClient, dynamodbClient *aws.DynamoDBClient, handler HttpHandler) *server.Server {
	endpoints := search.NewEndpoints(searchService{DB: db, Contract: contract, DynamoDBClient: dynamodbClient})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (s searchService) SearchForArticles(_ context.Context, request *search.SearchRequest) (res *search.Searchresult, err error) {
	baseQuery := s.DB

	var ownedByAddr *common.Address

	// Build base query.
	if request.OwnedBy != nil {
		ownedByAddr, err = s.DynamoDBClient.GetAddressByID(*request.OwnedBy)
		if err != nil {
			var apiErr smithy.APIError
			if errors.As(err, &apiErr) && apiErr.ErrorCode() == aws.ItemNotFoundCode {
				ownedByAddr = nil
			} else {
				return nil, err
			}
		}

		var ownedArticleIDs []string
		if ownedByAddr != nil {
			ownedArticleIDs, err = s.Contract.GetArticleIdsOwnedBy(&bind.CallOpts{}, *ownedByAddr)
			if err != nil {
				return nil, err
			}

			for i, url := range ownedArticleIDs {
				// TODO: Do this part on the contract side.
				ownedArticleIDs[i] = strings.TrimPrefix(url, "https://knowtfolio.com/nfts/")
			}
		}

		ownedByCond := s.DB.
			// Articles that has been tokenized and whose token is owned by the user.
			Where(`articles.id IN ?`, ownedArticleIDs).
			// Articles that hasn't been tokenized and is originally created by the user.
			Or(s.DB.Where(`is_tokenized = 0`).Where(`original_author_id = ?`, *request.OwnedBy))
		baseQuery = baseQuery.Where(ownedByCond)
	}
	if request.Keywords != nil {
		keywords := strings.Split(*request.Keywords, " ")
		for _, keyword := range keywords {
			baseQuery = baseQuery.Where(`raw_text LIKE ?`, fmt.Sprintf("%%%s%%", keyword))
		}
	}

	// NOTE: Need to call `Session` here to make baseQuery sharable.
	// https://gorm.io/ja_JP/docs/method_chaining.html#New-Session-Method
	baseQuery = baseQuery.Joins("Document").Session(&gorm.Session{})

	// Branch loading query and counting query from baseQuery.
	offset := int((request.PageNum - 1) * request.PageSize)
	limit := int(request.PageSize)
	loadQuery := baseQuery.
		Select("articles.id", "original_author_id", "is_tokenized").
		Offset(offset).Limit(limit).Order(request.SortBy)
	countQuery := baseQuery.Model(&models.Article{})

	// Load matching articles.
	var targets []models.Article
	result := loadQuery.Find(&targets)
	if result.Error != nil {
		return nil, result.Error
	}

	// Count total matches.
	var totalCount int64
	result = countQuery.Count(&totalCount)
	if result.Error != nil {
		return nil, result.Error
	}

	// Convert articles to response body.
	entries := make([]*search.SearchResultEntry, len(targets))
	for i, target := range targets {
		var ownerID string
		var ownerAddr *common.Address

		if request.OwnedBy != nil {
			ownerID = *request.OwnedBy
			ownerAddr = ownedByAddr
		} else {
			ownerAddr, err = s.Contract.GetOwnerAddressOf(target)
			if err != nil {
				return nil, err
			}
			if ownerAddr != nil {
				ownerID, err = s.DynamoDBClient.GetIDByAddress(*ownerAddr)
			} else {
				ownerID = target.OriginalAuthorID
				ownerAddr, err = s.DynamoDBClient.GetAddressByID(ownerID)
			}
			if err != nil {
				return nil, err
			}
		}

		var ownerAddrStr *string
		if ownerAddr != nil {
			ownerAddrStr = new(string)
			*ownerAddrStr = ownerAddr.String()
		}
		entries[i] = &search.SearchResultEntry{
			ID:           target.ID,
			Title:        target.Document.Title,
			OwnerID:      ownerID,
			OwnerAddress: ownerAddrStr,
		}
	}

	return &search.Searchresult{Results: entries, TotalCount: uint(totalCount)}, nil
}
