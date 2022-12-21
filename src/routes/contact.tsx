import { Skeleton } from "@mui/material";
import { FC, Suspense } from "react";
import {
  Await,
  defer,
  Form,
  LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
} from "react-router-dom";

import { ContactDto, getContact, updateContact } from "../contacts";
import { queryClient } from "../main";

export const loader = ({ params }: LoaderFunctionArgs) => {
  const contact = queryClient.fetchQuery(`contacts/${params.contactId}`, () => getContact(params.contactId), { staleTime: 6000 * 10 });

  return defer({ contact });
};

export async function action({ request, params }: LoaderFunctionArgs) {
  let formData = await request.formData();

  const url = new URL(request.url);

  await updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  });

  await queryClient.invalidateQueries(['contacts', url.searchParams.get('q') ?? '']);
  await queryClient.invalidateQueries(`contacts/${params.contactId}`);

  return true;
}

export default function Contact() {
  const data = useLoaderData() as Record<string, any>;

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
          <div id="contact">
            <div>
              <img key={contact.avatar} src={contact.avatar} />
            </div>

            <div>
              <h1>
                {contact.first || contact.last ? (
                  <>
                    {contact.first} {contact.last}
                  </>
                ) : (
                  <i>No Name</i>
                )}{" "}
                <Favorite contact={contact} />
              </h1>

              {contact.twitter && (
                <p>
                  <a
                    target="_blank"
                    href={`https://twitter.com/${contact.twitter}`}
                  >
                    {contact.twitter}
                  </a>
                </p>
              )}

              {contact.notes && <p>{contact.notes}</p>}

              <div>
                <Form action="edit">
                  <button type="submit">Edit</button>
                </Form>
                <Form
                  method="post"
                  action="destroy"
                  onSubmit={(event) => {
                    if (
                      !confirm("Please confirm you want to delete this record.")
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <button type="submit">Delete</button>
                </Form>
              </div>
            </div>
          </div>
        )}
      </Await>
    </Suspense>
  );
}

const Favorite: FC<{ contact: ContactDto }> = ({ contact }) => {
  const fetcher = useFetcher();

  let favorite = contact.favorite;

  if (fetcher.formData) {
    favorite = fetcher.formData.get("favorite") === "true";
  }

  return (
    <fetcher.Form method="post">
      <button
        name="favorite"
        value={favorite ? "false" : "true"}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};
