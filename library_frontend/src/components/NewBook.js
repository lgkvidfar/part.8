import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { ADD_BOOK, ALL_BOOKS, ALL_AUTHORS } from '../queries/queries'

const NewBook = ({ show, updateCacheWith }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const authorsRequest = useQuery(ALL_AUTHORS)

  const [ addBook ] = useMutation(ADD_BOOK, {
    refetchQueries: [ { query: ALL_BOOKS } ],
    update: (store, response ) => {
      console.log(response)
      updateCacheWith(response.data.addBook)
    }
  })
  if (!show || authorsRequest.loading) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    console.log('add book...')
    try{
      await addBook({ variables: { title, author, published, genres } })
    } catch (error) {
      throw error.graphQLErrors
    }

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            required={true}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            required={true}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={Number(published) || ''}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook