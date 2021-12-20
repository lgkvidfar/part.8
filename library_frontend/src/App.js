import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import NewAuthor from './components/NewAuthor'
import LoginForm from './components/LoginForm'
import { 
   useSubscription, useApolloClient, gql
} from '@apollo/client'
import Recommended from './components/Recommended'

import { BOOK_DETAILS, AUTHOR_DETAILS, ALL_BOOKS } from './queries/queries'

const ErrorNotification = ({ errorMessage }) => {
  if(!errorMessage) {
  return null
} else {
  return (
    <div style={{ color: 'red'}}>
      {errorMessage}
    </div>
  )
}
}

const SuccessNotification = ({ successMessage }) => {
  if(!successMessage) {
  return null
} else {
  return (
    <div style={{ color: 'green'}}>
      {successMessage}
    </div>
  )
}
}

export const AUTHOR_ADDED = gql`
  subscription {
    authorAdded {
      ...AuthorDetails
    }
  }
${AUTHOR_DETAILS}
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
${BOOK_DETAILS}
`

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const userCheck = localStorage.hasOwnProperty('library-user-token') 

  const handleLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    console.log(`token is now ${token}`)
    window.location.reload()
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      setSuccessMessage(`${addedBook.title} added`)
      setTimeout(() => {
        setSuccessMessage(null)
      },2000)
      updateCacheWith(addedBook)
    }
  })

  useSubscription(AUTHOR_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedAuthor = subscriptionData.data.authorAdded
      console.log(addedAuthor)
      setSuccessMessage(`${addedAuthor.name} added`)
      setTimeout(() => {
        setSuccessMessage(null)
      },2000)
      updateCacheWith(addedAuthor)
    }
  })

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(b => b.id).includes(object.id)  

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) }
      })
    }   
  }

  return (
    <div>
      <div>
        {userCheck && 
        <button onClick={() => setPage('recommended')}>recommended</button>
        }
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {userCheck && 
          <button onClick={() => setPage('addBook')}>add book</button>
        }
        {userCheck && 
          <button onClick={() => setPage('addAuthor')}>add author</button>
        }
        {!userCheck && 
        <button onClick={() => setPage('loginUser')}>log in</button>
        }
      </div>
      <ErrorNotification errorMessage={errorMessage}/>
      <SuccessNotification successMessage={successMessage}/>

      <Recommended 
        show={page === 'recommended'}
      />

      <Authors
        show={page === 'authors'}
        setErrorMessage={setErrorMessage}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'addBook'}
        updateCacheWith={updateCacheWith}
      />

      <NewAuthor
        show={page === 'addAuthor'}
        updateCacheWith={updateCacheWith}
      />

       <LoginForm 
        show={page === 'loginUser'}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage} 
        setToken={setToken}
        updateCacheWith={updateCacheWith}

      />

      {userCheck && <button type="button" onClick={handleLogout}>logout</button>}
    </div>
  )
}

export default App