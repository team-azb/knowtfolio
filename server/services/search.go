package services

import (
	"context"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/search/server"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/search"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
	"strings"
)

type searchService struct {
	DB       *gorm.DB
	Contract *ethereum.ContractClient
}

func NewSearchService(db *gorm.DB, contract *ethereum.ContractClient, handler HttpHandler) *server.Server {
	endpoints := search.NewEndpoints(searchService{DB: db, Contract: contract})
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

	// Build base query.
	if request.OwnedBy != nil {
		ownedArticleIds, err := s.Contract.GetArticleIdsOwnedBy(&bind.CallOpts{}, common.HexToAddress(*request.OwnedBy))
		for i, url := range ownedArticleIds {
			// TODO: Do this part on the contract side.
			ownedArticleIds[i] = strings.TrimPrefix(url, "https://knowtfolio.com/nfts/")
		}

		if err != nil {
			return nil, err
		}
		ownedByCond := s.DB.
			// Articles that has been tokenized and whose token is owned by the user.
			Where(`id IN ?`, ownedArticleIds).
			// Articles that hasn't been tokenized and is originally created by the user.
			Or(s.DB.Where(`is_tokenized = 0`).Where(`original_author_address = ?`, *request.OwnedBy))
		baseQuery = baseQuery.Where(ownedByCond)
	}
	if request.Keywords != nil {
		keywords := strings.Split(*request.Keywords, "+")
		for i := range keywords {
			keywords[i] = fmt.Sprintf(`"%v"`, keywords[i])
		}
		baseQuery = baseQuery.Where(`MATCH(title, raw_text) against(? IN BOOLEAN MODE)`, strings.Join(keywords, " "))
	}

	// Branch loading query and counting query from baseQuery.
	offset := int((request.PageNum - 1) * request.PageSize)
	limit := int(request.PageSize)
	loadQuery := baseQuery.
		Select("id", "title", "original_author_address").
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
		var ownerAddr string
		if request.OwnedBy != nil {
			ownerAddr = *request.OwnedBy
		} else {
			// TODO: Add bulk get function to the contract.
			owner, err := s.Contract.GetOwnerAddressOf(target)
			if err != nil {
				return nil, err
			}
			ownerAddr = owner.String()
		}
		entries[i] = &search.SearchResultEntry{
			ID:           target.ID,
			Title:        target.Title,
			OwnerAddress: ownerAddr,
		}
	}

	return &search.Searchresult{Results: entries, TotalCount: uint(totalCount)}, nil
}
