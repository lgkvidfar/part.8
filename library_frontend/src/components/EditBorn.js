import React, { useState, useEffect } from "react"
import { useMutation, useQuery } from "@apollo/client"
import Select from "react-select"

import { EDIT_BORN, ALL_AUTHORS } from '../queries/queries'

const EditBorn = ({ setErrorMessage }) => {
    const [ name, setName ] = useState('')
    const [ born, setBorn ] = useState('')

    const [ changeBorn, result ] = useMutation(EDIT_BORN, {
        onError: (error) => {
            setErrorMessage(error.graphQLErrors[0].message)
            setTimeout(() => {
                setErrorMessage(null)
            }, 2000)
        },
    },{
        refetchQueries: [ { query: ALL_AUTHORS },
         ]
    })

    const authors = useQuery(ALL_AUTHORS).data.allAuthors

    const optionsAuthorsNames = authors.map(a => { return { label: a.name, value: a.name } } )

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            await changeBorn({ variables: { name, born } })
        } catch (error) {
            throw console.log(error.message)
          }
        setBorn('')
    }

    const onChangeAuthor = (inputName) => {
        setName(inputName.value)
    }

    useEffect(() => {
        if(result.data && result.data.editBorn === null) {
            console.log('person to edit not found')
        }
    }, [result.data])

    if(authors.loading){
        return (
            <div>..loading...</div>)
    }

    return (
    <div>
        <h2>edit year of birth</h2>
        <form onSubmit={handleSubmit} >
            {/* <div>
                <input placeholder="name" value={name} onChange={({ target }) => setName(target.value)} />
            </div> */}
            <Select 
            options={optionsAuthorsNames}
            onChange={onChangeAuthor}
            placeholder="select author"
            />
            <div>
                <input 
                placeholder="new year of birth" 
                value={Number(born) || ''} 
                onChange={({ target }) => setBorn(Number(target.value))} 
                required={true} 
                />
            </div>
            <button type="submit">save</button>
        </form>
    </div>
    )
}

export default EditBorn