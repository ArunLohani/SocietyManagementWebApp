import { gql } from "apollo-angular";

export const GET_NOTICE_BY_ID = gql`
  query GetNoticeById($id: ID!) {
    getNoticeById(id: $id) {
      id
      title
      message
      category
      tenant {
        id
        name
      }
      isPublic
      isExpired
      priority
    }
  }
`;

export const CREATE_NOTICE = gql`
  mutation CreateNotice($input: CreateNoticeRequest!) {
    createNotice(input: $input) {
      id
      title
      message
      category
      isPublic
      isExpired
      priority
    }
  }
`;