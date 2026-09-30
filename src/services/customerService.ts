import type { Customer } from '../types';

let customers: Customer[] = [
  { id: 101, name: 'Harish Kumar', email: 'harish@northstar.dev', company: 'Northstar Labs', status: 'Active' },
  { id: 102, name: 'Maya Patel', email: 'maya@atlas.io', company: 'Atlas Systems', status: 'Trial' },
  { id: 103, name: 'Asha Nair', email: 'asha@brightpath.co', company: 'Brightpath', status: 'Active' },
  { id: 104, name: 'Leon Chen', email: 'leon@quartz.app', company: 'Quartz', status: 'Paused' },
];

const wait = (ms = 450) => new Promise(resolve => window.setTimeout(resolve, ms));

export async function listCustomers(query = ''): Promise<Customer[]> {
  await wait();
  const normalized = query.trim().toLowerCase();
  return customers.filter(customer => [customer.name, customer.email, customer.company, customer.status].some(value => value.toLowerCase().includes(normalized)));
}

export async function getCustomer(id: number): Promise<Customer> {
  await wait(350);
  const customer = customers.find(item => item.id === id);
  if (!customer) throw new Error('Customer not found');
  return customer;
}

export async function createCustomer(input: Omit<Customer, 'id'>): Promise<Customer> {
  await wait(300);
  const customer = { ...input, id: Math.max(...customers.map(item => item.id), 100) + 1 };
  customers = [customer, ...customers];
  return customer;
}

export async function updateCustomer(id: number, input: Omit<Customer, 'id'>): Promise<Customer> {
  await wait(300);
  const updated = { ...input, id };
  customers = customers.map(item => item.id === id ? updated : item);
  return updated;
}

export async function deleteCustomer(id: number): Promise<void> {
  await wait(300);
  customers = customers.filter(item => item.id !== id);
}

export function resetCustomers() {
  customers = [
    { id: 101, name: 'Harish Kumar', email: 'harish@northstar.dev', company: 'Northstar Labs', status: 'Active' },
    { id: 102, name: 'Maya Patel', email: 'maya@atlas.io', company: 'Atlas Systems', status: 'Trial' },
    { id: 103, name: 'Asha Nair', email: 'asha@brightpath.co', company: 'Brightpath', status: 'Active' },
    { id: 104, name: 'Leon Chen', email: 'leon@quartz.app', company: 'Quartz', status: 'Paused' },
  ];
}
