package services

import (
	"context"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/search"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	"go.uber.org/multierr"
	"testing"
)

var (
	goArticle = models.NewArticle("Golang", []byte("<div> Build fast, reliable, and efficient software at scale. </div>"), testUsers[0].ID)
	rsArticle = models.NewArticle("Rust", []byte("<div> A language empowering everyone to build reliable and efficient software. </div>"), testUsers[0].ID)
	pyArticle = models.NewArticle("Python", []byte("<div> Python is a programming language that lets you work quickly and integrate systems more effectively. </div>"), testUsers[0].ID)
	ktArticle = models.NewArticle("Kotlin", []byte("<div> A modern programming language that makes developers happier. </div>"), testUsers[1].ID)
	jsArticle = models.NewArticle("JavaScript", []byte("<div> JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions. </div>"), testUsers[1].ID)
	tsArticle = models.NewArticle("TypeScript", []byte("<div> TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. </div>"), testUsers[1].ID)
)

var (
	createEntry = func(article *models.Article, owner *testUser) search.SearchResultEntry {
		return search.SearchResultEntry{ID: article.ID, Title: article.Document.Title, OwnerID: owner.ID, OwnerAddress: &owner.Address}
	}
	goEntry = createEntry(goArticle, &testUsers[0])
	rsEntry = createEntry(rsArticle, &testUsers[1])
	pyEntry = createEntry(pyArticle, &testUsers[0])
	ktEntry = createEntry(ktArticle, &testUsers[1])
	jsEntry = createEntry(jsArticle, &testUsers[0])
	tsEntry = createEntry(tsArticle, &testUsers[1])
)

func tokenizeTestTargetArticle(client *ethereum.ContractClient, target *models.Article, ownerAddr string) error {
	opts, err := client.NewAdminTransactOpts()
	if err != nil {
		return err
	}

	transactionLock[opts.From.String()].Lock()
	defer transactionLock[opts.From.String()].Unlock()

	target.SetIsTokenized()
	_, err = client.MintNFT(opts, common.HexToAddress(ownerAddr), target.ID)

	return err
}

func prepareSearchService(t *testing.T) searchService {
	t.Parallel()

	service := searchService{
		DB:             initTestDB(t),
		Contract:       initTestContractClient(t),
		DynamoDBClient: aws.NewDynamoDBClient(),
	}

	// Mint NFTs for the target articles.
	err0 := tokenizeTestTargetArticle(service.Contract, goArticle, testUsers[0].Address)
	err1 := tokenizeTestTargetArticle(service.Contract, rsArticle, testUsers[1].Address)
	err2 := tokenizeTestTargetArticle(service.Contract, ktArticle, testUsers[1].Address)
	err3 := tokenizeTestTargetArticle(service.Contract, jsArticle, testUsers[0].Address)
	err := multierr.Combine(err0, err1, err2, err3)
	if err != nil {
		t.Fatal(err)
	}

	// Insert targets
	result := service.DB.Create([]models.Article{*goArticle, *rsArticle, *pyArticle, *ktArticle, *jsArticle, *tsArticle})
	if result.Error != nil {
		t.Fatal(result.Error)
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
		service := prepareSearchService(t)

		result, err := service.SearchForArticles(context.Background(), &search.SearchRequest{
			OwnedBy: &testUsers[0].ID,
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

	t.Run("PaginationWithConds", func(t *testing.T) {
		service := prepareSearchService(t)

		keywords := "language"
		result1, err1 := service.SearchForArticles(context.Background(), &search.SearchRequest{
			Keywords: &keywords,
			OwnedBy:  &testUsers[0].ID,
			PageSize: 1,
			PageNum:  1,
		})
		result2, err2 := service.SearchForArticles(context.Background(), &search.SearchRequest{
			Keywords: &keywords,
			OwnedBy:  &testUsers[0].ID,
			PageSize: 1,
			PageNum:  2,
		})
		combinedResults := append(result1.Results, result2.Results...)

		// Assert request body.
		expectedResults := []*search.SearchResultEntry{&pyEntry, &jsEntry}
		assert.NoError(t, multierr.Combine(err1, err2))
		assert.ElementsMatch(t, expectedResults, combinedResults)
		assert.EqualValues(t, len(expectedResults), result1.TotalCount)
		assert.EqualValues(t, len(expectedResults), result2.TotalCount)
	})
}
