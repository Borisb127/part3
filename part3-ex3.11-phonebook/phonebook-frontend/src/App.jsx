import { useState, useEffect } from 'react';

import personsService from './services/persons.js';
import Filter from './components/Filter';
import Notification from './components/Notification';
import Persons from './components/Persons';
import PersonForm from './components/PersonForm';




const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filterName, setFilterName] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);


  // Fetch initial persons data from server
  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons  => {
        setPersons(initialPersons)
      })
  }, []);



  // Handle input changes
  const handleNameChange = (event) => {setNewName(event.target.value)}
  const handleNumberChange = (event) => {setNewNumber(event.target.value)}
  const handleFilterChange = (event) => {setFilterName(event.target.value)}


  

// Validation function
  const validateInputs = () => {
    const validations = [
      {
        test: !/\S/.test(newName),
        message: 'Name cannot be empty or just space.'
      },
      {
        test: !/\S/.test(newNumber),
        message: 'Number cannot be empty or just space.'
      },
      {
        test: !/^[A-Za-z ]+$/.test(newName),
        message: 'Name can contain only letters.'
      },
      {
        test: !/^[0-9- ]+$/.test(newNumber),
        message: 'Number can contain only digits and dashes'
      }
    ]

    const failedValidation = validations.find(validation => validation.test)
    
    if (failedValidation) {
      alert(failedValidation.message)
      return false
    }
    
    return true
  }




  // Handle form submission
  const addPerson = (event) => {
    event.preventDefault()

    // Check for existing name and update
    const existingPerson = persons.find(p => p.name === newName);

    if(existingPerson) {
      const confirmUpdate  = window.confirm(`${newName} is already added to the phonebook, replace the old number with a new one?`);
      
      if (confirmUpdate) {
        const updatedPerson = {...existingPerson, number: newNumber}
        
        personsService
          .update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson));
            setNewName('');
            setNewNumber('');
          })
          .catch(error => {
            alert(`Failed to update ${existingPerson.name}`);
          })
        return; // Stop further execution if updating
      }
    } else {
    // Add new person
    if (validateInputs()) {
      const personObject = { name: newName, number: newNumber } 
      personsService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(prevPersonState => [...prevPersonState, returnedPerson]);
          setSuccessMessage(`Added ${returnedPerson.name}`);
          setTimeout(() => {setSuccessMessage(null);}, 5000);
          setNewName('');
          setNewNumber('');
        })
        .catch(error => {
          alert('Failed to add person');
        });
        
      }
    }
  }
  
  
 // Handle person delete
 const onDelete = (id) => {
  const personToDelete = persons.find(p => p.id === id)
  const confirmDelete = window.confirm(`Delete ${personToDelete.name}`)
  
  if (confirmDelete) { 
    personsService
      .deletePerson(personToDelete.id)
      .then(() => {setPersons(persons.filter(p => p.id !== id))})
      .catch(error => {
        setErrorMessage(`Information of ${personToDelete.name} has already been removed form server`);
        setTimeout(() => {setErrorMessage(null);}, 5000);
        setPersons(persons.filter(p => p.id !== id))
      })
  }
} 




  const filteredPersons = persons.filter(person => 
    person.name.toLowerCase().includes(filterName.toLocaleLowerCase())

  )


  return (
    <div>

      <h2>Phonebook</h2>
      <Notification message={successMessage} type="success" />
      <Notification message={errorMessage} type="error" />
      <Filter filterName={filterName} handleFilterChange={handleFilterChange} />
  

      <h2>Add a new</h2>
      <PersonForm addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange} />    

      <h2>Numbers</h2>
      <Persons persons={filteredPersons} onDelete={onDelete} />
      
    </div>
  )
}

export default App