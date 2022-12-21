import { Skeleton } from "@mui/material";
import { Suspense } from "react";
import {
  Await,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

import { updateContact } from "../contacts";
import { queryClient } from "../query";

export const action: LoaderFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  const url = new URL(request.url);
  await updateContact(params.contactId, updates);
  await queryClient.invalidateQueries(['contacts', url.searchParams.get('q') ?? '']);
  await queryClient.invalidateQueries(`contacts/${params.contactId}`);

  return redirect(`/contacts/${params.contactId}`);
};

export default function EditContact() {
  const navigate = useNavigate();
  const data = useLoaderData() as any;

  return (
    <Suspense
      fallback={
        <div>
          <Skeleton
            animation="wave"
            variant="text"
            width={100}
            sx={{ fontSize: "1rem" }}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
          />
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={100}
            height={60}
          />
          <Skeleton
            animation="wave"
            variant="rounded"
            width={100}
            height={60}
          />
        </div>
      }
    >
      <Await resolve={data.contact}>
        {(contact) => (
          <Form method="post" id="contact-form">
            <p>
              <span>Name</span>
              <input
                placeholder="First"
                aria-label="First name"
                type="text"
                name="first"
                defaultValue={contact.first}
              />
              <input
                placeholder="Last"
                aria-label="Last name"
                type="text"
                name="last"
                defaultValue={contact.last}
              />
            </p>
            <label>
              <span>Twitter</span>
              <input
                type="text"
                name="twitter"
                placeholder="@jack"
                defaultValue={contact.twitter}
              />
            </label>
            <label>
              <span>Avatar URL</span>
              <input
                placeholder="https://example.com/avatar.jpg"
                aria-label="Avatar URL"
                type="text"
                name="avatar"
                defaultValue={contact.avatar}
              />
            </label>
            <label>
              <span>Notes</span>
              <textarea name="notes" defaultValue={contact.notes} rows={6} />
            </label>
            <p>
              <button type="submit">Save</button>
              <button type="button" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </p>
          </Form>
        )}
      </Await>
    </Suspense>
  );
}
