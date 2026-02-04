import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { GET_NOTICE_BY_ID } from '../../../graphql/notice.graphql';
import { Notice } from '../../../types/types';
import { map, Observable } from 'rxjs';

export interface NoticeByIdResponse {
  getNoticeById: Notice;
}

@Injectable({
  providedIn: 'root',
})

export class NoticeGraphqlService {

  constructor(private apollo: Apollo) { }

  getNoticeById(id: number): Observable<Notice> {
    return this.apollo.query<NoticeByIdResponse>({
      query: GET_NOTICE_BY_ID,
      variables: { id },
      fetchPolicy: 'no-cache',
    }).pipe(
      map(result => {
        // ✅ Handle undefined case
        if (!result.data) {
          throw new Error('No data returned from query');
        }
        return result.data.getNoticeById;
      })
    );
  }

}
