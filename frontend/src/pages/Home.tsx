import { RoomForm } from "../components/RoomForm"

export function Home() {
  return (
    <section className="h-full flex flex-col">
      <div className="h-full w-full flex justify-around  items-center">
        <div className="p-6 rounded-lg border border-white/10 pb-12">
          <RoomForm />
        </div>
      </div>
    </section>
  )
}
