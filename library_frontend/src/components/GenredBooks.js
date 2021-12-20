import React from 'react'
import { ALL_BOOKS } from '../queries/queries'
import { useQuery } from '@apollo/client'

const GenredBooks = ({ genre }) => {

    const result = useQuery(ALL_BOOKS)
  
    if (result.loading || result.data === undefined) {
      return <div>loading...</div>
    }

    const allBooks = result.data.allBooks
    const genredBooks = allBooks.filter(b => b.genres.includes(genre))

    if(genredBooks.length === 0) {
        return null
    }
    
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {genredBooks.map(b =>
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name || 'unknown'}</td>
              <td>{b.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default GenredBooks