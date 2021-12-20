import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { ADD_AUTHOR, ALL_AUTHORS } from '../queries/queries'

const NewAuthor = ({ show, updateCacheWith }) => {
  const [ name, setName ] = useState('')
  const [ born, setBorn ] = useState('')

  const [ addAuthor ] = useMutation(ADD_AUTHOR, {
      refetchQueries: [ { query: ALL_AUTHORS}],
      update: (store, response ) => {
        updateCacheWith(response.data.addAuthor)
      }
  })

  const result = useQuery(ALL_AUTHORS)

  if (!show || result.data === undefined ) {
    return null
  }
  if(result.data.loading){
    return (
        <div>..loading...</div>)
  }
  const handleSubmit = async (event) => {
    event.preventDefault()
    if(result.data.allAuthors.includes(name)) {
      throw console.log("author already in library")
    }
    try {
      await addAuthor({ variables: { name, born } })
    } catch (error) {
      throw console.log(error.message)
    }
    setName('')
    setBorn(Number(''))
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
            required={true}
          />
        </div>
        <div>
          born
          <input
            value={Number(born) || ''} 
            onChange={({ target }) => setBorn(Number(target.value))} 
            required={true} 
          />
        </div>
        <button readOnly={true} type='submit'>create author</button>
      </form>
    </div>
  )
}

export default NewAuthor