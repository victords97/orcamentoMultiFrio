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

const DOCUMENT_TYPES = {
  budget: {
    title: 'Orçamento',
    prefix: 'ORC',
    actionLabel: 'Gerar PDF do orçamento',
  },
  receipt: {
    title: 'Recibo',
    prefix: 'REC',
    actionLabel: 'Gerar PDF do recibo',
  },
}

const WARRANTY_OPTIONS = ['30 dias', '60 dias', '90 dias']
const PAYMENT_OPTIONS = ['Dinheiro', 'Pix', 'Cartão/Débito', 'Cartão/Crédito']

function generateDocumentNumber(type = 'budget') {
  const map = getManausParts()
  const shortYear = map.year.slice(-2)
  const datePart = `${map.day}${map.month}${shortYear}`
  const timePart = `${map.hour}${map.minute}`
  const uniquePart = crypto.randomUUID().slice(0, 4).toUpperCase()

  const prefix = DOCUMENT_TYPES[type]?.prefix || DOCUMENT_TYPES.budget.prefix

  return `${prefix}-${datePart}-${timePart}-${uniquePart}`
}

function formatIssuedAt(value) {
  const [date = '', time = ''] = value.split('T')
  const [year = '', month = '', day = ''] = date.split('-')

  if (!year || !month || !day) {
    return '-'
  }

  return `${day}/${month}/${year} ${time || '00:00'}`
}

function createInitialState(type = 'budget') {
  const documentType = DOCUMENT_TYPES[type] ? type : 'budget'

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
      type: documentType,
      title: DOCUMENT_TYPES[documentType].title,
      number: generateDocumentNumber(documentType),
      issuedAt: getManausDateTimeLocal(),
      validity: '30 dias',
      warranty: '90 dias',
      paymentMethod: 'Pix',
      installments: '1',
    },
    customer: {
      name: '',
      taxId: '',
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
  const currentDocumentType = DOCUMENT_TYPES[form.document.type] || DOCUMENT_TYPES.budget

  const totals = useMemo(() => {
    const total = form.services.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    )

    return { total }
  }, [form.services])
  const receiptPaymentDescription =
    form.document.paymentMethod === 'Cartão/Crédito'
      ? `${form.document.paymentMethod} em ${form.document.installments || '1'}x`
      : form.document.paymentMethod || 'Pix'
  const receiptWarranty = form.document.warranty || '90 dias'
  const receiptDeclaration = `Eu declaro ter recebido o valor de ${currency.format(
    totals.total,
  )} via ${receiptPaymentDescription}.`

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

  const handleDocumentTypeChange = (type) => {
    const nextDocumentType = DOCUMENT_TYPES[type] ? type : 'budget'

    setForm((current) => ({
      ...current,
      document: {
        ...current.document,
        type: nextDocumentType,
        title: DOCUMENT_TYPES[nextDocumentType].title,
        number: generateDocumentNumber(nextDocumentType),
      },
    }))
    setIsPreviewOpen(false)
  }

  const handlePaymentMethodChange = (value) => {
    setForm((current) => ({
      ...current,
      document: {
        ...current.document,
        paymentMethod: value,
        installments:
          value === 'Cartão/Crédito' ? current.document.installments || '1' : '1',
      },
    }))
  }

  const handleReset = () => {
    setForm(createInitialState(form.document.type))
    setIsPreviewOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className="control-panel no-print">
        <div className="panel-header">
          <div>
            <p className="eyebrow">MULTIFRIO</p>
            <h1>Gerador de documentos</h1>
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
          <h2>Tipo de documento</h2>
          <div className="document-type-toggle" role="group" aria-label="Tipo de documento">
            <button
              type="button"
              className={form.document.type === 'budget' ? 'type-button active' : 'type-button'}
              onClick={() => handleDocumentTypeChange('budget')}
            >
              Orçamento
            </button>
            <button
              type="button"
              className={form.document.type === 'receipt' ? 'type-button active' : 'type-button'}
              onClick={() => handleDocumentTypeChange('receipt')}
            >
              Recibo
            </button>
          </div>
        </section>

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
                      setSection(
                        'document',
                        'number',
                        generateDocumentNumber(form.document.type),
                      )
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
            {form.document.type === 'budget' ? (
              <label>
                Validade do orçamento
                <input
                  value={form.document.validity}
                  onChange={(event) => setSection('document', 'validity', event.target.value)}
                />
              </label>
            ) : (
              <>
                <label>
                  Garantia da mão de obra
                  <select
                    value={form.document.warranty}
                    onChange={(event) => setSection('document', 'warranty', event.target.value)}
                  >
                    {WARRANTY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Forma de pagamento
                  <select
                    value={form.document.paymentMethod}
                    onChange={(event) => handlePaymentMethodChange(event.target.value)}
                  >
                    {PAYMENT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                {form.document.paymentMethod === 'Cartão/Crédito' ? (
                  <label>
                    Quantidade de vezes
                    <select
                      value={form.document.installments}
                      onChange={(event) =>
                        setSection('document', 'installments', event.target.value)
                      }
                    >
                      {Array.from({ length: 12 }, (_, index) => String(index + 1)).map(
                        (option) => (
                          <option key={option} value={option}>
                            {option}x
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                ) : null}
              </>
            )}
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
            {form.document.type === 'receipt' ? (
              <label>
                CPF/CNPJ
                <input
                  value={form.customer.taxId}
                  onChange={(event) => setSection('customer', 'taxId', event.target.value)}
                />
              </label>
            ) : null}
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

        {form.document.type === 'budget' ? (
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
        ) : null}

        <div className="action-row no-print">
          <button type="button" className="primary-button" onClick={() => setIsPreviewOpen(true)}>
            {currentDocumentType.actionLabel}
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

            <section className={form.document.type === 'receipt' ? 'sheet receipt-sheet' : 'sheet'}>
              <header className="sheet-header">
                <div className="company-column">
                  <img src={logo} alt="Logo da MULTIFRIO" className="company-logo" />
                  <h2>{form.company.name}</h2>
                  <p>
                    <strong>CNPJ:</strong> {form.company.cnpj}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {form.company.phone}
                  </p>
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
                    {form.document.type === 'receipt' ? (
                      <p>
                        <strong>CPF/CNPJ:</strong> {form.customer.taxId || '-'}
                      </p>
                    ) : null}
                    <p>
                      <strong>Contato:</strong> {form.customer.contact || '-'}
                    </p>
                  </div>
                </div>
              </header>

              <div className="table-scroll">
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
              </div>

              <div className="totals-card">
                <div className="grand-total">
                  <span>{form.document.type === 'receipt' ? 'Total recebido' : 'Preço Final'}</span>
                  <strong>{currency.format(totals.total)}</strong>
                </div>
              </div>

              <section className="notes-area">
                {form.document.type === 'budget' ? (
                  <>
                    <p>
                      <strong>Validade do orçamento:</strong> {form.document.validity}
                    </p>
                    <p>
                      <strong>Observações</strong>
                    </p>
                    <p>{form.notes || '-'}</p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Garantia da mão de obra:</strong> {receiptWarranty}
                    </p>
                    <p>
                      <strong>Declaração</strong>
                    </p>
                    <p>{receiptDeclaration}</p>
                    <p className="receipt-thanks">
                      A MULTIFRIO agradece a preferência e permanece à disposição para
                      futuros serviços e atendimentos.
                    </p>
                  </>
                )}
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
