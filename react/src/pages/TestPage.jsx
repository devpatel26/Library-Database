import TestComponentNoData from "../components/TestComponentNoData";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import Item, { Book } from "../components/Items";

export default function TestPage() {
  const dummyBook1 = {
    title: "Demian",
    type: "Paperback",
    language: "English",
    genre: "Bildungsroman",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu fringilla nisi. Nullam in imperdiet eros. Praesent eget ultrices leo, ut congue orci. Mauris lorem felis, viverra quis neque ac, mollis venenatis elit. Mauris ultrices nibh nunc, ac auctor mi interdum a. Fusce lacus sem, gravida sit amet ligula mollis, molestie semper augue. Pellentesque vel quam id metus volutpat pharetra. Nulla quis sem interdum massa varius malesuada. Suspendisse hendrerit sodales congue. ",
    publisher: "Penguin Classics",
    shelfNumber: 1,
    publicationDate: "2013",
    author: { firstName: "Herman", lastName: "Hesse" },
    available: 2,
    onHold: 1,
    unavailable: 5,
  };
  const dummyBook2 = {
    title: "Crime and Punishment",
    type: "Paperback",
    language: "English",
    genre: "Psychological Thriller",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec scelerisque vestibulum eros, at dignissim orci dapibus a. Nulla et luctus libero, nec lacinia est. Praesent eget nisi volutpat, tristique neque a, volutpat tellus. Mauris at lacus eget tortor cursus lacinia eu ut turpis. Maecenas dignissim erat id sapien interdum commodo. Praesent a placerat neque. Mauris vulputate tortor vitae cursus semper. Fusce volutpat magna ut lorem lacinia consequat.",
    publisher: "Penguin Books",
    shelfNumber: 1,
    publicationDate: "2018",
    author: { firstName: "Fyodor", lastName: "Dostoyevsky" },
    available: 0,
    onHold: 2,
    unavailable: 3,
  };
  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          Testing
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Test Page
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          This view is set up for isolated component checks and quick UI
          validation.
        </p>
      </div>
      <TestComponentNoData />

      <PrimaryButton title={"Primary Button"} />
      <SecondaryButton title={"Secondary Button"} />
      <div>
        <SecondaryButton title={"Cancel"} />
        <PrimaryButton title={"Register"} />
      </div>
      <Item itemType={Book} itemData={dummyBook1} />
      <Item itemType={Book} itemData={dummyBook2} />
    </div>
  );
}
