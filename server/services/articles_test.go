package services

import (
	"context"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/articles"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/articles/server"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	"testing"
)

func prepareArticlesService(t *testing.T) articleService {
	t.Parallel()

	service := articleService{
		DB:       initTestDB(t),
		Contract: initTestContractClient(t),
	}
	err := service.DB.AutoMigrate(models.Article{})
	if err != nil {
		t.Fatal(err)
	}

	return service
}

var (
	user0Addr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
	user1Addr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
	// Generated with https://go.dev/play/p/AcIbm14Swn8 .
	user0CreateSign = "0xbb80a6f3ecfab4ce6652b42735fae23aa514126ae97edb56e6ec1201a16d338516ad305638212d306eb73b9052232fc3d13bf2a9ce2519ea11ae3ecc228732e601"
	user0UpdateSign = "0x36d57b4a13d21d273bc098ae1da1f60efec5923764e72682655543d824c9c54570b93c37dd5f77fe4303e5a770edcc798285919186006b17bfca9f690a86f1d501"
	user0DeleteSign = "0x98c07e186c5de61b9fd55f0d7a1c9e4204dd270768eaffeba6911804b38e47f973aa35e84e0347d99b3adf6ec1eacb2baa42811391761e1c589d0de8521b58be00"
	user1UpdateSign = "0xa2878366c13a37082970fc6d9e9bfdfd7de4759a82134584a0de7b0bd591322d59e74aa23e0a8e388d0ec3cccebcd97e9e076908e103cac493af6e820e8b332b00"
	user1DeleteSign = "0x8f049d4fea2b9bdc1ac1ed50f1f3b54c1a3345897c9d4b83ad849b44663a0dd96119eb5ab6e8a5498ca423fa0c8577e7597df5f0a9b78e9581ba98dd0346e61601"
	article0        = *models.NewArticle("Article0", []byte("<h1> content0 </h1>"), user0Addr)
	article1        = *models.NewArticle("Article1", []byte("<div> content1 </div>"), user0Addr)
)

func TestCreateArticle(t *testing.T) {
	service := prepareArticlesService(t)

	result, err := service.Create(context.Background(), &articles.ArticleCreateRequest{
		Title:     article0.Title,
		Content:   string(article0.Content),
		Address:   user0Addr,
		Signature: user0CreateSign,
	})

	// Assert request body.
	assert.NoError(t, err)
	assert.Equal(t, article0.Title, result.Title)
	assert.Equal(t, string(article0.Content), result.Content)

	// Assert DB contents.
	article0.ID = result.ID
	target := models.Article{ID: article0.ID}
	res := service.DB.First(&target)
	assert.NoError(t, res.Error)
	assert.Equal(t, article0.ID, target.ID)
	assert.Equal(t, article0.Title, target.Title)
	assert.Equal(t, article0.Content, target.Content)
}

func TestReadArticle(t *testing.T) {
	t.Run("WithoutNFT", func(t *testing.T) {
		service := prepareArticlesService(t)

		service.DB.Create(&article0)

		result, err := service.Read(context.Background(), &articles.ArticleReadRequest{ID: article0.ID})

		// Assert request body.
		assert.NoError(t, err)
		assert.Equal(t, article0.ID, result.ID)
		assert.Equal(t, article0.Title, result.Title)
		assert.Equal(t, article0.OriginalAuthorAddress, result.OwnerAddress)
		assert.Equal(t, string(article0.Content), result.Content)
	})

	t.Run("WithNFT", func(t *testing.T) {
		service := prepareArticlesService(t)

		// Article0 here is created by user0 and currently owned by user1.
		service.DB.Create(&article0)
		mintNFTOfArticle0AndWait(t, service.Contract, user1Addr)

		result, err := service.Read(context.Background(), &articles.ArticleReadRequest{ID: article0.ID})

		// Assert request body.
		assert.NoError(t, err)
		assert.Equal(t, article0.ID, result.ID)
		assert.Equal(t, article0.Title, result.Title)
		assert.Equal(t, user1Addr, result.OwnerAddress)
		assert.Equal(t, string(article0.Content), result.Content)
	})
}

func TestUpdateArticle(t *testing.T) {
	newTitle := article1.Title
	newContentStr := string(article1.Content)
	updateRequestByUser0 := articles.ArticleUpdateRequest{
		ID:        article0.ID,
		Title:     &newTitle,
		Content:   &newContentStr,
		Address:   user0Addr,
		Signature: user0UpdateSign,
	}
	updateRequestByUser1 := articles.ArticleUpdateRequest{
		ID:        article0.ID,
		Title:     &newTitle,
		Content:   &newContentStr,
		Address:   user1Addr,
		Signature: user1UpdateSign,
	}

	t.Run("SuccessAsNFTOwner", func(t *testing.T) {
		service := prepareArticlesService(t)

		// Create article and the corresponding NFT.
		service.DB.Create(&article0)
		mintNFTOfArticle0AndWait(t, service.Contract, user0Addr)

		// Send update request
		result, err := service.Update(context.Background(), &updateRequestByUser0)
		expected := articles.ArticleResult{
			ID:      article0.ID,
			Title:   newTitle,
			Content: newContentStr,
		}

		// Assert request body.
		assert.NoError(t, err)
		assert.Equal(t, expected, *result)

		// Assert DB contents.
		article0.ID = result.ID
		target := models.Article{ID: article0.ID}
		res := service.DB.First(&target)
		assert.NoError(t, res.Error)
		assert.Equal(t, expected.ID, target.ID)
		assert.Equal(t, expected.Title, target.Title)
		assert.Equal(t, []byte(expected.Content), target.Content)
	})

	t.Run("FailWithoutNFT", func(t *testing.T) {
		service := prepareArticlesService(t)

		service.DB.Create(&article0)

		_, err := service.Update(context.Background(), &updateRequestByUser0)

		// Assert request error.
		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "unauthorized", namer.ErrorName())
	})

	t.Run("FailsAsNonNFTOwner", func(t *testing.T) {
		service := prepareArticlesService(t)

		// Create article and the corresponding NFT.
		service.DB.Create(&article0)
		mintNFTOfArticle0AndWait(t, service.Contract, user0Addr)

		// Send update request
		_, err := service.Update(context.Background(), &updateRequestByUser1)

		// Assert request error.
		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "unauthorized", namer.ErrorName())
	})
}

func TestDeleteArticles(t *testing.T) {
	deleteRequestByUser0 := articles.ArticleDeleteRequest{
		ID:        article0.ID,
		Address:   user0Addr,
		Signature: user0DeleteSign,
	}
	deleteRequestByUser1 := articles.ArticleDeleteRequest{
		ID:        article0.ID,
		Address:   user1Addr,
		Signature: user1DeleteSign,
	}

	t.Run("SuccessAsOriginalAuthor", func(t *testing.T) {
		service := prepareArticlesService(t)

		service.DB.Create(&article0)

		_, err := service.Delete(context.Background(), &deleteRequestByUser0)

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

		_, err := service.Delete(context.Background(), &deleteRequestByUser1)

		// Assert request error.
		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "unauthorized", namer.ErrorName())
	})
}

func mintNFTOfArticle0AndWait(t *testing.T, cli *ethereum.ContractClient, ownerAddr string) {
	opts, err := cli.NewAdminTransactOpts()
	if err != nil {
		t.Fatal(err)
	}
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
