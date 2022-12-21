import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export interface ContactDto {
  id: string;
  first: string;
  last: string;
  avatar?: string;
  twitter?: string;
  notes?: string;
  favorite: boolean;
  createdAt: number;
}

export async function getContacts(query = "") {
  console.debug("get contacts", Date.now());

  await fakeNetwork();

  let contacts = (await localforage.getItem<ContactDto[]>("contacts")) ?? [];

  if (query) {
    contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
  }

  return contacts.sort(sortBy("last", "createdAt"));
}

export async function createContact() {
  console.debug("create contact", Date.now());

  await fakeNetwork();

  let contact = {
    id: Math.random().toString(36).substring(2, 9),
    first: "",
    last: "",
    favorite: false,
    createdAt: Date.now(),
  };

  await set([contact, ...(await getContacts())]);

  return contact;
}

export async function getContact(id = "") {
  console.debug("get contact", Date.now());

  await fakeNetwork(`contact:${id}`);

  return (await localforage.getItem<ContactDto[]>("contacts"))?.find(
    (x) => x.id === id
  );
}

export async function updateContact(
  id = "",
  updates: Partial<Exclude<ContactDto, "id">>
) {
  await fakeNetwork();

  let contacts = (await localforage.getItem<ContactDto[]>("contacts")) ?? [];
  let contact = contacts.find((x) => x.id === id);

  if (!contact) throw new Error(`No contact found for ${id}`);

  Object.assign(contact, updates);

  await set(contacts);

  return contact;
}

export async function deleteContact(id = "") {
  let contacts = (await localforage.getItem<ContactDto[]>("contacts")) ?? [];
  let index = contacts.findIndex((contact) => contact.id === id);

  if (index > -1) {
    contacts.splice(index, 1);
    await set(contacts);
    return true;
  }

  return false;
}

function set(contacts: ContactDto[]) {
  return localforage.setItem("contacts", contacts);
}

async function fakeNetwork(key = "") {
  return new Promise((res) => {
    setTimeout(res, Math.random() * 1000 + 1500);
  });
}
