const cds = require("@sap/cds/lib");
const { expect } = cds.test(
  "serve",
  "CatalogService",
  "--from",
  "@capire/bookshop,@capire/common",
  "--in-memory"
);

describe("Consuming actions locally", () => {
  let cats, CatalogService, Books, tx, stockBefore;
  const BOOK_ID = 251;
  const QUANTITY = 1;

  before("bootstrap the database", async () => {
    CatalogService = cds.services.CatalogService;
    expect(CatalogService).not.to.be.undefined;

    Books = CatalogService.entities.Books;
    expect(Books).not.to.be.undefined;

    cats = await cds.connect.to("CatalogService");
  });

  beforeEach(async () => {
    // Read the stock before the action is called
    stockBefore = (await cats.get(Books, BOOK_ID)).stock;

    // Use a manual transaction to create a continuation with an authenticated user
    tx = await cats.tx({user: "alice"});
  });

  afterEach(async() => {
    await tx.rollback();
  })

  it("calls unbound actions - basic variant using srv.send", async () => {
    const res1 = await tx.send("submitOrder", {
      book: BOOK_ID,
      quantity: QUANTITY,
    });
    expect(res1.stock).to.eql(stockBefore - QUANTITY);
  });

  it("calls unbound actions - named args variant", async () => {
    const res2 = await tx.submitOrder({ book: BOOK_ID, quantity: QUANTITY });
    expect(res2.stock).to.eql(stockBefore - QUANTITY);
  });

  it("calls unbound actions - positional args variant", async () => {
    const res3 = await tx.submitOrder(BOOK_ID, QUANTITY);
    expect(res3.stock).to.eql(stockBefore - QUANTITY);
  });
});
