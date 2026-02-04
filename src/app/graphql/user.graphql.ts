import { gql } from "apollo-angular";

export const GET_USER_BY_ID = gql`
  query GetUserById($id: Long!) {
    userById(id: $id) {
      id
      name
      email
      roles {
        id
        role
      }
      tenant {
        id
        name
      }
    }
  }
`;