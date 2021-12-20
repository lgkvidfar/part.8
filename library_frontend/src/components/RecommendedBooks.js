import React, {useEffect } from "react"
import { useLazyQuery } from "@apollo/client"
import { FIND_BOOKS_BY_GENRE } from "../queries/queries"

const RecommendedBooks = ({ genre }) => {
    const [ loadRecommendedBooks, { loading, data} ] = useLazyQuery(
        FIND_BOOKS_BY_GENRE, { variables: { genreToSearch: 'genre' } }
    )
    useEffect(() => {
        loadRecommendedBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    if(loading) {
        return '...loading'
    } else if(data === undefined) {
        return '...loading'
    }
    console.log(data);
    return (
    <div>
        <p>these books we recommend to you</p>
    <table>
      <tbody>
        <tr>
          <th>title</th>
          <th>author</th>
          <th>published</th>
        </tr>
        {data.allBooks.map(b =>
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

export default RecommendedBooks