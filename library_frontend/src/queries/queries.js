import { gql } from '@apollo/client'

export const AUTHOR_DETAILS = gql`
fragment AuthorDetails on Author {
  name
  born
  authorsBooksCount
}
`

export const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published 
    author {
      name 
      born
    }
    genres
  }
`

export const ALL_AUTHORS = gql`
{
  allAuthors {
    ...AuthorDetails
  }
}
${AUTHOR_DETAILS}
`

export const ALL_BOOKS = gql`
   {
    allBooks {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const FIND_BOOKS_BY_GENRE = gql`
  query findBooksByGenre($genreToSearch: String!){
    allBooks(genre: $genreToSearch) {
      title
      published
      genres
      author {
        name
      }
    }
  }
`

export const ADD_BOOK= gql`
mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
    ) {
        title
        published
        author{
          name
        }
        genres
    }
}
`

export const ADD_AUTHOR = gql`
mutation addAuthor($name: String!, $born: Int!) {
    addAuthor(name: $name, born: $born) {
        name
        born
    }
}
`

export const EDIT_BORN = gql`
  mutation editAuthorBirth($name: String!, $born: Int!) {
      editAuthorBirth(name: $name, born: $born) {
          name
          born
      }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ME = gql`
  query me {
    me {
      username
      favoriteGenre
    }
  }
`

export const AUTHOR_ADDED = gql`
  subscription {
    authorAdded {
      ...AuthorDetails
    }
  }
${AUTHOR_DETAILS}
`