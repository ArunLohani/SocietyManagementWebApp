import { TestBed } from '@angular/core/testing';

import { NoticeGraphqlService } from './notice-graphql.service';

describe('NoticeGraphqlService', () => {
  let service: NoticeGraphqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoticeGraphqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
