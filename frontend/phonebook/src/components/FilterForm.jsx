const FilterForm = ({ filter, handleNameFilter }) => {
    return (
      <div>
        Filter shown with <input value={filter} onChange={handleNameFilter} />
      </div>
    )
  }
  
  export default FilterForm