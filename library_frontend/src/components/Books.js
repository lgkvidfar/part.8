import React,{ useState} from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries/queries'
import AllBooks from './AllBooks'
import GenredBooks from './GenredBooks'

const Books = ({ show }) => {
  const [ genre, setGenre ] = useState('')
  const result = useQuery(ALL_BOOKS)

  if (!show || result.data === undefined) {
    return null
  }

  if (result.loading || result.data === undefined) {
    return <div>loading...</div>
  }

  const allBooks = result.data.allBooks

  const handleGenre = (genre) => {
     if(genre === 'all') {
       setGenre('')
     } else {
       setGenre(genre)
     }
    }

  return (
    <div>
      <h2>books</h2>
      <button onClick={() => handleGenre('comedy')} >comedy</button>
      <button onClick={() => handleGenre('food')} >food</button>
      <button onClick={() => handleGenre('horror')} >horror</button>
      <button onClick={() => handleGenre('design')} >design</button>
      <button onClick={() => handleGenre('all')} >all</button>
      {!genre && <AllBooks books={allBooks}/>}
      {genre && <GenredBooks genre={genre} />}
    </div>
  )
}

export default Books