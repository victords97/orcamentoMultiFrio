import { useMemo, useState } from 'react'
import logo from '../assets/logo.png'

function getManausParts() {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Manaus',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())

  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

function getManausDateTimeLocal() {
  const map = getManausParts()

  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`
}

function generateDocumentNumber() {
  const map = getManausParts()
  const shortYear = map.year.slice(-2)
  const datePart = `${map.day}${map.month}${shortYear}`
  const timePart = `${map.hour}${map.minute}`
  const uniquePart = crypto.randomUUID().slice(0, 4).toUpperCase()

  return `ORC-${datePart}-${timePart}-${uniquePart}`
}

function formatIssuedAt(value) {
  const [date = '', time = ''] = value.split('T')
  const [year = '', month = '', day = ''] = date.split('-')

  if (!year || !month || !day) {
    return '-'
  }

  return `${day}/${month}/${year} ${time || '00:00'}`
}

function createInitialState() {
  return {
    company: {
      name: 'MULTIFRIO',
      cnpj: '45.735.139/0001-11',
      phone: '(92) 9 9174-9101',
      city: 'MANAUS-AM',
      neighborhood: 'ZUMBI DOS PALMARES',
      state: 'AMAZONAS',
      zipCode: '69084-370',
    },
    document: {
      title: 'Orçamento',
      number: generateDocumentNumber(),
      issuedAt: getManausDateTimeLocal(),
      validity: '90 dias',
    },
    customer: {
      name: '',
      contact: '',
    },
    notes: '',
    services: [
      {
        id: crypto.randomUUID(),
        description: '',
        price: 0,
        quantity: 1,
      },
    ],
  }
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function App() {
  const [isCompanyEditorOpen, setIsCompanyEditorOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [form, setForm] = useState(() => createInitialState())

  const totals = useMemo(() => {
    const total = form.services.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    )

    return { total }
  }, [form.services])

  const setSection = (section, key, value) => {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }))
  }

  const updateService = (id, key, value) => {
    setForm((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === id ? { ...service, [key]: value } : service,
      ),
    }))
  }

  const addService = () => {
    setForm((current) => ({
      ...current,
      services: [
        ...current.services,
        {
          id: crypto.randomUUID(),
          description: '',
          price: 0,
          quantity: 1,
        },
      ],
    }))
  }

  const removeService = (id) => {
    setForm((current) => ({
      ...current,
      services:
        current.services.length > 1
          ? current.services.filter((service) => service.id !== id)
          : current.services,
    }))
  }

  const handleReset = () => {
    setForm(createInitialState())
    setIsPreviewOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className="control-panel no-print">
        <div className="panel-header">
          <div>
            <p className="eyebrow">MULTIFRIO</p>
            <h1>Gerador de orçamentos</h1>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsCompanyEditorOpen((current) => !current)}
            >
              {isCompanyEditorOpen ? 'Ocultar empresa' : 'Editar dados da empresa'}
            </button>
            <button type="button" className="secondary-button" onClick={handleReset}>
              Limpar tela
            </button>
          </div>
        </div>

        {isCompanyEditorOpen ? (
          <section className="panel-section">
            <h2>Empresa</h2>
            <div className="grid two-columns">
              <label>
                Nome
                <input
                  value={form.company.name}
                  onChange={(event) => setSection('company', 'name', event.target.value)}
                />
              </label>
              <label>
                CNPJ
                <input
                  value={form.company.cnpj}
                  onChange={(event) => setSection('company', 'cnpj', event.target.value)}
                />
              </label>
              <label>
                Telefone
                <input
                  value={form.company.phone}
                  onChange={(event) => setSection('company', 'phone', event.target.value)}
                />
              </label>
              <label>
                Cidade
                <input
                  value={form.company.city}
                  onChange={(event) => setSection('company', 'city', event.target.value)}
                />
              </label>
              <label>
                Bairro
                <input
                  value={form.company.neighborhood}
                  onChange={(event) =>
                    setSection('company', 'neighborhood', event.target.value)
                  }
                />
              </label>
              <label>
                Estado
                <input
                  value={form.company.state}
                  onChange={(event) => setSection('company', 'state', event.target.value)}
                />
              </label>
              <label>
                CEP
                <input
                  value={form.company.zipCode}
                  onChange={(event) => setSection('company', 'zipCode', event.target.value)}
                />
              </label>
            </div>
          </section>
        ) : null}

        <section className="panel-section">
          <h2>Documento</h2>
          <div className="grid two-columns">
              <label>
                Título
                <input
                  value={form.document.title}
                  onChange={(event) => setSection('document', 'title', event.target.value)}
                />
              </label>
              <label>
                Número do documento
                <div className="document-number-row">
                  <input value={form.document.number} readOnly />
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setSection('document', 'number', generateDocumentNumber())
                    }
                  >
                    Gerar novo
                  </button>
                </div>
                <small className="helper-text">
                  Gerado automaticamente com identificador único.
                </small>
              </label>
            <label>
              Data e hora
              <input
                type="datetime-local"
                value={form.document.issuedAt}
                onChange={(event) => setSection('document', 'issuedAt', event.target.value)}
              />
            </label>
            <label>
              Garantia
              <input
                value={form.document.validity}
                onChange={(event) => setSection('document', 'validity', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="panel-section">
          <h2>Cliente</h2>
          <div className="grid two-columns">
            <label>
              Nome do cliente
              <input
                value={form.customer.name}
                onChange={(event) => setSection('customer', 'name', event.target.value)}
              />
            </label>
            <label>
              Contato
              <input
                value={form.customer.contact}
                onChange={(event) => setSection('customer', 'contact', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="panel-section">
          <div className="section-title-row">
            <h2>Servicos</h2>
            <button type="button" className="primary-button" onClick={addService}>
              Adicionar serviço
            </button>
          </div>

          <div className="service-editor-list">
            {form.services.map((service, index) => (
              <div className="service-editor" key={service.id}>
                <div className="service-editor-header">
                  <strong>Item {index + 1}</strong>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => removeService(service.id)}
                  >
                    Remover
                  </button>
                </div>
                <label>
                  Descrição
                  <textarea
                    rows="3"
                    value={service.description}
                    onChange={(event) =>
                      updateService(service.id, 'description', event.target.value)
                    }
                  />
                </label>
                <div className="grid two-columns">
                  <label>
                    Preço
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={service.price}
                      onChange={(event) =>
                        updateService(service.id, 'price', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Quantidade
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={service.quantity}
                      onChange={(event) =>
                        updateService(service.id, 'quantity', event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-section">
          <h2>Observações</h2>
          <label>
            Texto final
            <textarea
              rows="4"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </label>
        </section>

        <div className="action-row no-print">
          <button type="button" className="primary-button" onClick={() => setIsPreviewOpen(true)}>
            Gerar PDF
          </button>
        </div>
      </aside>

      {isPreviewOpen ? (
        <div className="pdf-modal">
          <div className="pdf-modal-backdrop" onClick={() => setIsPreviewOpen(false)} />
          <div className="pdf-modal-content">
            <div className="pdf-modal-toolbar no-print">
              <div>
                <p className="eyebrow">Prévia do PDF</p>
                <h2>Confira antes de imprimir</h2>
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Fechar
                </button>
                <button type="button" className="primary-button" onClick={() => window.print()}>
                  Imprimir / Salvar PDF
                </button>
              </div>
            </div>

            <section className="sheet">
              <header className="sheet-header">
                <div className="company-column">
                  <img src={logo} alt="Logo da MULTIFRIO" className="company-logo" />
                  <h2>{form.company.name}</h2>
                  <p>
                    <strong>CNPJ:</strong> {form.company.cnpj}
                  </p>
                  <p>{form.company.phone}</p>
                  <p>
                    <strong>Cidade:</strong> {form.company.city} <strong>Bairro:</strong>{' '}
                    {form.company.neighborhood} <strong>Estado:</strong> {form.company.state}
                  </p>
                  <p>
                    <strong>CEP:</strong> {form.company.zipCode}
                  </p>
                </div>

                <div className="document-column">
                  <h1>{form.document.title}</h1>
                  <div className="document-meta">
                    <div className="meta-row">
                      <span>Número do Documento</span>
                      <strong>{form.document.number || '-'}</strong>
                    </div>
                    <div className="meta-row">
                      <span>Data do Documento</span>
                      <strong>{formatIssuedAt(form.document.issuedAt)}</strong>
                    </div>
                  </div>

                  <div className="client-block">
                    <p>
                      <strong>Cliente:</strong> {form.customer.name || '-'}
                    </p>
                    <p>
                      <strong>Contato:</strong> {form.customer.contact || '-'}
                    </p>
                  </div>
                </div>
              </header>

              <table className="services-table">
                <thead>
                  <tr>
                    <th>Serviços</th>
                    <th>Preço</th>
                    <th>Quantidade</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {form.services.map((service) => {
                    const total =
                      Number(service.price || 0) * Number(service.quantity || 0)

                    return (
                      <tr key={service.id}>
                        <td className="description-cell">
                          {service.description || 'Serviço sem descrição'}
                        </td>
                        <td>{currency.format(Number(service.price || 0))}</td>
                        <td>{String(Math.trunc(Number(service.quantity || 0)))}</td>
                        <td>{currency.format(total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="totals-card">
                <div className="grand-total">
                  <span>Preço Final</span>
                  <strong>{currency.format(totals.total)}</strong>
                </div>
              </div>

              <section className="notes-area">
                <p>
                  <strong>Garantia da mão de obra:</strong> {form.document.validity}
                </p>
                <p>
                  <strong>Observações</strong>
                </p>
                <p>{form.notes || '-'}</p>
              </section>

              <footer className="signature-area">
                <div className="signature-script">Antonio</div>
                <div className="signature-line" />
                <p>Assinatura MULTIFRIO</p>
              </footer>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
