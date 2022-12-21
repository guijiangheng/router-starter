import { LoaderFunction, redirect } from 'react-router-dom';

import { deleteContact } from '../contacts';

export const action:LoaderFunction = async ({ params }) => {
  await deleteContact(params.contactId);
  
  return redirect("/");
}