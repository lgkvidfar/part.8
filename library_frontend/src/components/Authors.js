import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries/queries'
import EditBorn from './EditBorn'

const Authors = ({ show,setErrorMessage }) => {
  const result = useQuery(ALL_AUTHORS)

  if (!show || result.data === undefined) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>name</th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.authorsBooksCount}</td>
            </tr>
          )}
        </tbody>
      </table>
    <EditBorn setErrorMessage={setErrorMessage}/>
    </div>
  )
}

export default Authors