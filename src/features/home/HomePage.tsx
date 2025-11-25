import PageHeader from '../../components/PageHeader'
import ToolCard from '../../components/ToolCard'
import { tools } from '../tools/toolRegistry'

const HomePage = () => {
  return (
    <section className="space-y-10">
      <div className="glass-card p-10">
        <PageHeader
          eyebrow="Tool hub"
          title="Your go-to workspace for image utilities"
          description="Explore a curated set of utilities for creatives and marketers. Each tool launches in a dedicated workspace with focused controls."
        />
        <div className="mt-10 grid gap-6 text-sm text-slate-300 md:grid-cols-3">
          <div className="glass-card p-4">
            <p className="text-lg font-medium text-white">Fast iteration</p>
            <p>Instant previews powered by Vite and Tailwind.</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-lg font-medium text-white">Modular tools</p>
            <p>Each feature lives in its own folder plus shared UI.</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-lg font-medium text-white">Future-ready</p>
            <p>Registry-driven navigation makes adding tools simple.</p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Available tools</h2>
          <p className="text-sm text-slate-400">Select a tool to jump right in.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              name={tool.name}
              description={tool.description}
              status={tool.status}
              category={tool.category}
              href={tool.path}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomePage
