const Seperator = () => {
  return (
    <div className=" flex pb-3">
      <div className="flex-1 inset-0 flex items-center">
        <span className="w-full border-t border-slate-500" />
      </div>
      <div className="flex-0 flex justify-center text-xs uppercase">
        <span className=" bg-inherit px-2 text-muted-foreground">Or</span>
      </div>
      <div className="flex-1 inset-0 flex items-center">
        <span className="w-full border-t border-slate-500" />
      </div>
    </div>
  )
}

export default Seperator
