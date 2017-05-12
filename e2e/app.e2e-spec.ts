import { IntranetUFFrontPage } from './app.po';

describe('intranet-uffront App', function() {
  let page: IntranetUFFrontPage;

  beforeEach(() => {
    page = new IntranetUFFrontPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
