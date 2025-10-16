import './App.css'
import ScatterPlot from './components/scatterplot'
import DecisionTree from './components/decisiontree'
import LineChart from './components/linechart'
function App() {

  return (
    <>
      <div className="flex flex-col w-[95vw] text-left gap-8">
        <h1>Porky Best Data Mining Report</h1>
        <div className='flex h-[500px] w-full'>
            <ScatterPlot/>
        </div>
        <div className='flex h-[500px] w-full'>
            <DecisionTree/>
        </div>
        <div className='flex h-[500px] w-full'>
            <LineChart/>
        </div>
      </div>
    </>
  )
}

export default App
