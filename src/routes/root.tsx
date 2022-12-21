import cx from "clsx";
import { Suspense, useEffect, useRef } from "react";
import {
  Await,
  defer,
  Form,
  LoaderFunctionArgs,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router-dom";

import { Skeleton } from "@mui/material";

import { ContactDto, createContact, getContacts } from "../contacts";
import { queryClient } from "../main";

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const contacts = queryClient.fetchQuery({
    queryKey: [`contacts`, q],
    queryFn: () => getContacts(q),
    staleTime: 1000 * 60 * 10
  });

  return defer({ contacts });
};

export async function action() {
  const { id } = await createContact();

  return redirect(`/contacts/${id}/edit`);
}

export default function Root() {
  const navigation = useNavigation();
  const data = useLoaderData() as any;
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  const inputRef = useRef<HTMLInputElement>(null);

  const q = searchParams.get("q") ?? "";

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = q;
    }
  }, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              className={cx(searching && "loading")}
              ref={inputRef}
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
              defaultValue={q}
              onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget.form, { replace: !isFirstSearch });
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
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
            <Await resolve={data.contacts}>
              {(contacts) =>
                contacts.length ? (
                  <ul>
                    {contacts.map((contact: ContactDto) => (
                      <li key={contact.id}>
                        <NavLink
                          to={`contacts/${contact.id}`}
                          className={({ isActive, isPending }) =>
                            cx(isActive && "active", isPending && "pending")
                          }
                        >
                          {contact.first || contact.last ? (
                            <>
                              {contact.first} {contact.last}
                            </>
                          ) : (
                            <i>No Name</i>
                          )}{" "}
                          {contact.favorite && <span>★</span>}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    <i>No contacts</i>
                  </p>
                )
              }
            </Await>
          </Suspense>
        </nav>
      </div>
      <div
        id="detail"
        className={cx(navigation.state === "loading" && "loading")}
      >
        <Outlet />
      </div>
    </>
  );
}
