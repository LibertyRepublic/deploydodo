import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { EyeClosedIcon, EyeOpenIcon } from '@/assets/icons'
import { TextInput } from '@/components/TextInput'
import { Button } from '@/components/Button'
import { SectionCard, SectionHeader } from '../..'
import { SelectField } from '@/components/SelectField'

export function GeneralSection() {
  const [showHostUrl, setShowHostUrl] = useState(false)

  const generalForm = useFormik({
    initialValues: {
      name: 'Localhost',
      description: '',
      wildcardDomain: '',
      hostUrl: 'ssh://root@127.0.0.1:22',
      user: 'root',
      port: '22',
      timezone: 'UTC',
    },
    validationSchema: Yup.object({ name: Yup.string().required('Name is required') }),
    onSubmit: () => {},
  })

  return (
    <form onSubmit={generalForm.handleSubmit}>
      <SectionCard>
        <SectionHeader
          title="General"
          subtitle="Server is reachable and validated"
          right={<Button>Save</Button>}
        />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <TextInput
              label="Name"
              name="name"
              value={generalForm.values.name}
              onChange={generalForm.handleChange}
              onBlur={generalForm.handleBlur}
              hasError={generalForm.touched.name && !!generalForm.errors.name}
              errorMessage={generalForm.errors.name}
            />
            <TextInput
              label="Description"
              name="description"
              value={generalForm.values.description}
              onChange={generalForm.handleChange}
              onBlur={generalForm.handleBlur}
            />
            <TextInput
              label="Wildcard Domain"
              name="wildcardDomain"
              value={generalForm.values.wildcardDomain}
              onChange={generalForm.handleChange}
              onBlur={generalForm.handleBlur}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-3">
              <TextInput
                label="Host URL"
                name="hostUrl"
                type={showHostUrl ? 'text' : 'password'}
                value={generalForm.values.hostUrl}
                onChange={generalForm.handleChange}
                onBlur={generalForm.handleBlur}
                suffix={
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowHostUrl(!showHostUrl)}
                    className="p-0!"
                  >
                    {showHostUrl ? (
                      <EyeClosedIcon className="size-4" />
                    ) : (
                      <EyeOpenIcon className="size-4" />
                    )}
                  </Button>
                }
              />
            </div>
            <div className="flex-1">
              <TextInput
                label="User"
                name="user"
                value={generalForm.values.user}
                onChange={generalForm.handleChange}
                onBlur={generalForm.handleBlur}
              />
            </div>
            <div className="flex-1">
              <TextInput
                label="Port"
                name="port"
                value={generalForm.values.port}
                onChange={generalForm.handleChange}
                onBlur={generalForm.handleBlur}
              />
            </div>
          </div>
          <SelectField
            id="timezone"
            label="Server Timezone"
            value={generalForm.values.timezone}
            onChange={generalForm.handleChange}
            className="max-w-xs"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Africa/Lagos">Africa/Lagos</option>
          </SelectField>
        </div>
      </SectionCard>
    </form>
  )
}
