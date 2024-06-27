import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import PropTypes from 'prop-types'
import RagRecord from './RagRecord'

const RagHistoryCard = ({ ragRecords }) => {
  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle className="text-lg">My Files</CardTitle>
        <CardDescription>
          Chat with your documents or websites right away!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full flex flex-col">
          <div className="w-full flex items-center justify-between text-sm  px-3 gap-2 text-slate-600">
            <div className=" w-[5%]">No.</div>
            <div className="w-[55%] md:w-1/2 ">Source</div>
            <div className="w-[20%] min-w-[70px] md:w-[15%] ">Type</div>
            <div className="hidden md:w-[15%]  md:block">Created at</div>
            <div className="w-[20%] min-w-[70px] md:w-[15%]">
              <span className="sr-only">Actions</span>
            </div>
          </div>
          <div className="h-px bg-slate-300 mt-3" />

          {ragRecords.length > 0 &&
            ragRecords
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((record, index) => (
                <RagRecord key={index} record={record} index={index} />
              ))}
        </div>
      </CardContent>
    </Card>
  )
}

RagHistoryCard.propTypes = {
  ragRecords: PropTypes.array.isRequired,
}

export default RagHistoryCard
