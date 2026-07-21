import { useState } from 'react'
import { SectionCard, AreaChart, BarChart } from '../..'
import { SelectField } from '@/components/SelectField'
import { Button } from '@/components/Button'

export function MetricsSection() {
  const [metricsInterval, setMetricsInterval] = useState('5mins')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans font-bold text-3xl text-high-contrast m-0">Metrics</h2>
          <span className="font-sans font-normal text-sm text-text-secondary">
            Advanced configuration for your server
          </span>
        </div>
        <Button type="button" onClick={() => { }}>Save</Button>
      </div>

      <div className="flex flex-col gap-2 max-w-full">
        <SelectField
          id="metricsInterval"
          label="Interval"
          value={metricsInterval}
          onChange={(e) => setMetricsInterval(e.target.value)}
        >
          <option value="5mins">5mins (live)</option>
          <option value="15mins">15mins</option>
          <option value="1hour">1hour</option>
        </SelectField>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-6">
          <h3 className="font-sans font-bold text-xl text-high-contrast m-0">Memory Usage</h3>
          <div className="-mx-2">
            <AreaChart />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-6">
          <h3 className="font-sans font-bold text-xl text-high-contrast m-0">CPU Usage</h3>
          <div className="-mx-2">
            <BarChart />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
