package services

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/search"
	"github.com/team-azb/knowtfolio/server/models"
	"go.uber.org/multierr"
	"testing"
)

var (
	goArticle = models.NewArticle("Golang", []byte("<div> Build fast, reliable, and efficient software at scale. </div>"), user0Addr)
	rsArticle = models.NewArticle("Rust", []byte("<div> A language empowering everyone to build reliable and efficient software. </div>"), user0Addr)
	pyArticle = models.NewArticle("Python", []byte("<div> Python is a programming language that lets you work quickly and integrate systems more effectively. </div>"), user0Addr)
	ktArticle = models.NewArticle("Kotlin", []byte("<div> A modern programming language that makes developers happier. </div>"), user1Addr)
	jsArticle = models.NewArticle("JavaScript", []byte("<div> JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions. </div>"), user1Addr)
	tsArticle = models.NewArticle("TypeScript", []byte("<div> TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. </div>"), user1Addr)
)

var (
	goEntry = search.SearchResultEntry{ID: goArticle.ID, Title: goArticle.Title, OwnerAddress: user0Addr}
	rsEntry = search.SearchResultEntry{ID: rsArticle.ID, Title: rsArticle.Title, OwnerAddress: user1Addr}
	pyEntry = search.SearchResultEntry{ID: pyArticle.ID, Title: pyArticle.Title, OwnerAddress: user0Addr}
	ktEntry = search.SearchResultEntry{ID: ktArticle.ID, Title: ktArticle.Title, OwnerAddress: user1Addr}
	jsEntry = search.SearchResultEntry{ID: jsArticle.ID, Title: jsArticle.Title, OwnerAddress: user0Addr}
	tsEntry = search.SearchResultEntry{ID: tsArticle.ID, Title: tsArticle.Title, OwnerAddress: user1Addr}
)

func prepareSearchService(t *testing.T) searchService {
	t.Parallel()

	service := searchService{
		DB:       initTestDB(t),
		Contract: initTestContractClient(t),
	}
	err := service.DB.AutoMigrate(models.Article{})
	if err != nil {
		t.Fatal(err)
	}

	// Insert targets
	result := service.DB.Create([]models.Article{*goArticle, *rsArticle, *pyArticle, *ktArticle, *jsArticle, *tsArticle})
	if result.Error != nil {
		t.Fatal(result.Error)
	}

	// Mint NFTs for the targets.
	opts, err := service.Contract.NewAdminTransactOpts()
	if err != nil {
		t.Fatal(err)
	}
	transactionLock[opts.From.String()].Lock()
	defer transactionLock[opts.From.String()].Unlock()
	_, err0 := service.Contract.MintNFT(opts, common.HexToAddress(user0Addr), goArticle.ID)
	_, err1 := service.Contract.MintNFT(opts, common.HexToAddress(user1Addr), rsArticle.ID)
	_, err2 := service.Contract.MintNFT(opts, common.HexToAddress(user1Addr), ktArticle.ID)
	_, err3 := service.Contract.MintNFT(opts, common.HexToAddress(user0Addr), jsArticle.ID)
	err = multierr.Combine(err0, err1, err2, err3)
	if err != nil {
		t.Fatal(err)
	}

	return service
}

func TestSearchForArticles(t *testing.T) {
	t.Run("WithKeywords", func(t *testing.T) {
		service := prepareSearchService(t)

		keywords := "reliable+efficient"
		result, err := service.SearchForArticles(context.Background(), &search.SearchRequest{
			Keywords: &keywords,
		})

		// Assert request body.
		expectedResults := []*search.SearchResultEntry{&goEntry, &rsEntry}
		assert.NoError(t, err)
		assert.ElementsMatch(t, expectedResults, result.Results)
		assert.EqualValues(t, len(expectedResults), result.TotalCount)
	})

	t.Run("WithoutKeywords", func(t *testing.T) {
		service := prepareSearchService(t)

		result, err := service.SearchForArticles(context.Background(), &search.SearchRequest{})

		// Assert request body.
		expectedResults := []*search.SearchResultEntry{&goEntry, &rsEntry, &pyEntry, &ktEntry, &jsEntry, &tsEntry}
		assert.NoError(t, err)
		assert.ElementsMatch(t, expectedResults, result.Results)
		assert.EqualValues(t, len(expectedResults), result.TotalCount)
	})

	t.Run("WithOwnedBy", func(t *testing.T) {
		// TODO: Remove this after `isTokenized` is added and used to filter transferred articles.
		t.Skip("Currently this condition is not met.")

		service := prepareSearchService(t)

		result, err := service.SearchForArticles(context.Background(), &search.SearchRequest{
			OwnedBy: &user0Addr,
		})

		// Assert request body.
		expectedResults := []*search.SearchResultEntry{&goEntry, &pyEntry, &jsEntry}
		assert.NoError(t, err)
		assert.ElementsMatch(t, expectedResults, result.Results)
		assert.EqualValues(t, len(expectedResults), result.TotalCount)
	})

	t.Run("Pagination", func(t *testing.T) {
		service := prepareSearchService(t)

		result1, err1 := service.SearchForArticles(context.Background(), &search.SearchRequest{PageSize: 2, PageNum: 1})
		result2, err2 := service.SearchForArticles(context.Background(), &search.SearchRequest{PageSize: 2, PageNum: 2})
		result3, err3 := service.SearchForArticles(context.Background(), &search.SearchRequest{PageSize: 2, PageNum: 3})
		combinedResults := append(append(result1.Results, result2.Results...), result3.Results...)

		// Assert request body.
		expectedResults := []*search.SearchResultEntry{&goEntry, &rsEntry, &pyEntry, &ktEntry, &jsEntry, &tsEntry}
		assert.NoError(t, multierr.Combine(err1, err2, err3))
		assert.ElementsMatch(t, expectedResults, combinedResults)
		assert.EqualValues(t, len(expectedResults), result1.TotalCount)
		assert.EqualValues(t, len(expectedResults), result2.TotalCount)
		assert.EqualValues(t, len(expectedResults), result3.TotalCount)
	})
}
