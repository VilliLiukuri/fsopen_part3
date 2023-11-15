/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import FilterForm from './components/FilterForm'
import PersonForm from './components/PersonForm'
import PersonList from './components/PersonsList'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])

  const handleNameChange = (event) => {setNewName(event.target.value)}
  const handleNumberChange = (event) => {setNewNumber(event.target.value)}
  const handleNameFilter = (event) => {setFilter(event.target.value)}

  const isValidPhoneNumber = (number) =>/^(\d{2}-\d{7}|\d{3}-\d{8})$/.test(number)

  const addPerson = (event) => {
    event.preventDefault()
    if (newName.length < 3) {
      setErrorMessage('Name must be at least three characters long.')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      return
    }
    if (!isValidPhoneNumber(newNumber)) {
      setErrorMessage('Is not a valid phone number!.');
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return;
    }
    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      if (window.confirm(`${newName} is already in the phonebook. Do you want to update the number?`)) {
        const updatedPerson = { ...existingPerson, number: newNumber }
        personService
          .update(existingPerson.id, updatedPerson)
          .then(response => {
            setPersons(persons.map(person => (person.id !== existingPerson.id ? person : response.data)))
            setNewName('')
            setNewNumber('')
            setSuccessMessage(`Updated number for ${newName}`)
            setTimeout(() => {
              setSuccessMessage(null)
          }, 5000)
          })
          .catch(error => {
            setErrorMessage('Failed to update the number.')
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
          })
      }
    } else {
      const personObject = { name: newName, number: newNumber }
      personService
        .create(personObject)
        .then(response => {
          setPersons(persons.concat(response.data))
          setNewName('')
          setNewNumber('')
          setSuccessMessage(`Added ${newName}`)
          setTimeout(() => {
            setSuccessMessage(null)
        }, 5000)
        })
        .catch(error => {
          setErrorMessage('Failed to add the contact.')
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  const deletePerson = (id, name) => {
    if (window.confirm('Do you really want to delete this contact?')) {
      personService
        .remove(id)
        .then((response) => {
          setPersons(persons.filter((person) => person.id !== id))
          setSuccessMessage(`Deleted ${name}`)
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        })
        .catch((error) => {
          setErrorMessage('Failed to delete the contact.')
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  const Notification = ({ message, isError }) => {
    const notificationClass = message ? `popup-message show-popup${isError ? ' error' : ''}`: 'popup-message'
  
    return (
      <div className={notificationClass}>
        {message}
      </div>
    )
  }

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <Notification message={successMessage} />
      <Notification message={errorMessage} isError={true}/>
      <h2>Phonebook</h2>
      <FilterForm filter={filter} handleNameFilter={handleNameFilter}/>
      <h2>add a new</h2>
      <PersonForm 
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h2>Numbers</h2>
      <PersonList persons={filteredPersons} deletePerson={deletePerson}/>
    </div>
  )
}

export default App