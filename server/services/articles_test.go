package services

import (
	"context"
	"testing"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/articles"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/articles/server"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
)

func prepareArticlesService(t *testing.T) articleService {
	t.Parallel()

	service := articleService{
		DB:             initTestDB(t),
		Contract:       initTestContractClient(t),
		CognitoClient:  aws.NewCognitoClient(),
		DynamoDBClient: aws.NewDynamoDBClient(),
	}

	return service
}

var (
	article0          = *models.NewArticle("Article0", []byte("<h1> content0 </h1>"), testUsers[0].ID)
	article1          = *models.NewArticle("Article1", []byte("<div> content1 </div>"), testUsers[0].ID)
	tokenizedArticle0 = models.Article{
		ID:               article0.ID,
		Document:         article0.Document,
		OriginalAuthorID: article0.OriginalAuthorID,
		IsTokenized:      true,
	}
)

func TestCreateArticle(t *testing.T) {
	service := prepareArticlesService(t)

	result, err := service.Create(
		testUsers[0].GetUserIDContext(),
		&articles.ArticleCreateRequest{
			Title:   article0.Document.Title,
			Content: string(article0.Document.Content),
			Token:   testUsers[0].IDToken,
		},
	)

	// Assert request body.
	assert.NoError(t, err)
	assert.Equal(t, article0.Document.Title, result.Title)
	assert.Equal(t, string(article0.Document.Content), result.Content)

	// Assert DB contents.
	target := models.Article{ID: result.ID}
	res := service.DB.Preload("Document").First(&target)
	assert.NoError(t, res.Error)
	assert.Equal(t, result.ID, target.ID)
	assert.Equal(t, article0.Document.Title, target.Document.Title)
	assert.Equal(t, article0.Document.Content, target.Document.Content)
}

func TestReadArticle(t *testing.T) {
	t.Run("WithoutNFT", func(t *testing.T) {
		service := prepareArticlesService(t)

		service.DB.Create(&article0)

		result, err := service.Read(context.Background(), &articles.ArticleReadRequest{ID: article0.ID})

		// Assert request body.
		assert.NoError(t, err)
		assert.Equal(t, article0.ID, result.ID)
		assert.Equal(t, article0.Document.Title, result.Title)
		assert.Equal(t, testUsers[0].ID, result.OwnerID)
		assert.Equal(t, testUsers[0].Address(), *result.OwnerAddress)
		assert.Equal(t, string(article0.Document.Content), result.Content)
	})

	t.Run("WithNFT", func(t *testing.T) {
		service := prepareArticlesService(t)

		// Article0 here is created by user0 and currently owned by user1.
		service.DB.Create(&tokenizedArticle0)
		mintNFTOfArticle0AndWait(t, service.Contract, testUsers[1].Address())

		result, err := service.Read(context.Background(), &articles.ArticleReadRequest{ID: tokenizedArticle0.ID})

		// Assert request body.
		assert.NoError(t, err)
		assert.Equal(t, tokenizedArticle0.ID, result.ID)
		assert.Equal(t, tokenizedArticle0.Document.Title, result.Title)
		assert.Equal(t, testUsers[1].ID, result.OwnerID)
		assert.Equal(t, testUsers[1].Address(), *result.OwnerAddress)
		assert.Equal(t, string(tokenizedArticle0.Document.Content), result.Content)
	})
}

func TestUpdateArticle(t *testing.T) {
	newTitle := article1.Document.Title
	newContentStr := string(article1.Document.Content)
	updateRequestByUser0 := articles.ArticleUpdateRequest{
		ID:      article0.ID,
		Title:   &newTitle,
		Content: &newContentStr,
		Token:   testUsers[0].IDToken,
	}
	updateRequestByUser1 := articles.ArticleUpdateRequest{
		ID:      article0.ID,
		Title:   &newTitle,
		Content: &newContentStr,
		Token:   testUsers[1].IDToken,
	}

	t.Run("SuccessAsNFTOwner", func(t *testing.T) {
		service := prepareArticlesService(t)

		// Create article and the corresponding NFT.
		service.DB.Create(&tokenizedArticle0)
		mintNFTOfArticle0AndWait(t, service.Contract, testUsers[0].Address())

		// Send update request
		result, err := service.Update(testUsers[0].GetUserIDContext(), &updateRequestByUser0)
		expected := articles.ArticleResult{
			ID:      tokenizedArticle0.ID,
			Title:   newTitle,
			Content: newContentStr,
		}

		// Assert request body.
		assert.NoError(t, err)
		assert.Equal(t, expected, *result)

		// Assert DB contents.
		tokenizedArticle0.ID = result.ID
		target := models.Article{ID: tokenizedArticle0.ID}
		res := service.DB.Preload("Document").First(&target)
		assert.NoError(t, res.Error)
		assert.Equal(t, expected.ID, target.ID)
		assert.Equal(t, expected.Title, target.Document.Title)
		assert.Equal(t, []byte(expected.Content), target.Document.Content)
	})

	t.Run("SuccessWithoutNFTAsOwner", func(t *testing.T) {
		service := prepareArticlesService(t)

		service.DB.Create(&article0)

		// Send update request
		result, err := service.Update(testUsers[0].GetUserIDContext(), &updateRequestByUser0)
		expected := articles.ArticleResult{
			ID:      article0.ID,
			Title:   newTitle,
			Content: newContentStr,
		}

		// Assert request body.
		assert.NoError(t, err)
		assert.Equal(t, expected, *result)

		// Assert DB contents.
		tokenizedArticle0.ID = result.ID
		target := models.Article{ID: tokenizedArticle0.ID}
		res := service.DB.Preload("Document").First(&target)
		assert.NoError(t, res.Error)
		assert.Equal(t, expected.ID, target.ID)
		assert.Equal(t, expected.Title, target.Document.Title)
		assert.Equal(t, []byte(expected.Content), target.Document.Content)
	})

	t.Run("FailsAsNonNFTOwner", func(t *testing.T) {
		service := prepareArticlesService(t)

		// Create article and the corresponding NFT.
		service.DB.Create(&tokenizedArticle0)
		mintNFTOfArticle0AndWait(t, service.Contract, testUsers[0].Address())

		// Send update request
		_, err := service.Update(testUsers[1].GetUserIDContext(), &updateRequestByUser1)

		// Assert request error.
		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "unauthorized", namer.ErrorName())
	})

	t.Run("FailWithoutNFTAsNonOwner", func(t *testing.T) {
		service := prepareArticlesService(t)

		// Create article
		service.DB.Create(&article0)

		// Send update request
		_, err := service.Update(testUsers[1].GetUserIDContext(), &updateRequestByUser1)

		// Assert request error.
		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "unauthorized", namer.ErrorName())
	})
}

func TestDeleteArticles(t *testing.T) {
	deleteRequestByUser0 := articles.ArticleDeleteRequest{
		ID:    article0.ID,
		Token: testUsers[0].IDToken,
	}
	deleteRequestByUser1 := articles.ArticleDeleteRequest{
		ID:    article0.ID,
		Token: testUsers[1].IDToken,
	}

	t.Run("SuccessAsOriginalAuthor", func(t *testing.T) {
		service := prepareArticlesService(t)

		service.DB.Create(&article0)

		_, err := service.Delete(testUsers[0].GetUserIDContext(), &deleteRequestByUser0)

		// Assert that the entry is removed.
		target := models.Article{ID: article0.ID}
		var entryCount int64
		res := service.DB.Model(target).Count(&entryCount)
		assert.NoError(t, err)
		assert.NoError(t, res.Error)
		assert.EqualValues(t, 0, entryCount)
	})

	t.Run("FailAsNonOwner", func(t *testing.T) {
		service := prepareArticlesService(t)

		service.DB.Create(&article0)

		_, err := service.Delete(testUsers[1].GetUserIDContext(), &deleteRequestByUser1)

		// Assert request error.
		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "unauthorized", namer.ErrorName())
	})
}

func TestJWTAuth(t *testing.T) {
	t.Run("SuccessWithValidToken", func(t *testing.T) {
		service := prepareArticlesService(t)

		ctx, err := service.JWTAuth(context.Background(), testUsers[0].IDToken, nil)
		userID, ok := ctx.Value(UserIDCtxKey).(string)

		assert.NoError(t, err)
		assert.True(t, ok)
		assert.Equal(t, testUsers[0].ID, userID)
	})

	t.Run("FailWithInvalidToken", func(t *testing.T) {
		service := prepareArticlesService(t)

		_, err := service.JWTAuth(context.Background(), "invalid-token", nil)

		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "unauthenticated", namer.ErrorName())
	})
}

func mintNFTOfArticle0AndWait(t *testing.T, cli *ethereum.ContractClient, ownerAddr string) {
	opts, err := cli.NewAdminTransactOpts()
	if err != nil {
		t.Fatal(err)
	}

	transactionLock[opts.From.String()].Lock()
	defer transactionLock[opts.From.String()].Unlock()

	tx, err := cli.MintNFT(opts, common.HexToAddress(ownerAddr), article0.ID)
	if err != nil {
		t.Fatal(err)
	}

	// Wait for NFT to be created.
	_, err = bind.WaitMined(context.Background(), cli, tx)
	if err != nil {
		t.Fatal(err)
	}
}
