import { useQuery } from "@apollo/client"
import React from "react"
import RecommendedBooks from './RecommendedBooks'
import { ME } from "../queries/queries"

const Recommended = ({show}) => {
  const user = useQuery(ME)

  if(!show){
    return null
  }
  else if(user.loading) {
    return null
  } else if(user.data === undefined) {
    return 'loading... window must be refreshed'
  }
  console.log(user)
  const favoriteGenre = user.data.me.genre
  const username = user.data.me.username
  console.log(username)

  return (
  <div>
    <h3>welcome {username}</h3>
    <RecommendedBooks genre={favoriteGenre}/>
  </div>
  )
}

export default Recommended