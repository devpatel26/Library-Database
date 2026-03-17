import TestComponentNoData from "../components/TestComponentNoData";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import Item, { ItemHold, ItemLoan } from "../components/Items";

export default function TestPage() {
  const dummyData1 = {
    category: "book",
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
  const dummyDataL1 = {
    category: "book",
    title: "Demian",
    type: "Paperback",
    language: "English",
    genre: "Bildungsroman",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu fringilla nisi. Nullam in imperdiet eros. Praesent eget ultrices leo, ut congue orci. Mauris lorem felis, viverra quis neque ac, mollis venenatis elit. Mauris ultrices nibh nunc, ac auctor mi interdum a. Fusce lacus sem, gravida sit amet ligula mollis, molestie semper augue. Pellentesque vel quam id metus volutpat pharetra. Nulla quis sem interdum massa varius malesuada. Suspendisse hendrerit sodales congue. ",
    publisher: "Penguin Classics",
    shelfNumber: 1,
    publicationDate: "2013",
    loanStart: "10-02-2025",
    loanEnd: "10-16-2025",
    overdue: false,
    author: { firstName: "Herman", lastName: "Hesse" },
  };
  const dummyDataL2 = {
    category: "book",
    title: "Demian",
    type: "Paperback",
    language: "English",
    genre: "Bildungsroman",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu fringilla nisi. Nullam in imperdiet eros. Praesent eget ultrices leo, ut congue orci. Mauris lorem felis, viverra quis neque ac, mollis venenatis elit. Mauris ultrices nibh nunc, ac auctor mi interdum a. Fusce lacus sem, gravida sit amet ligula mollis, molestie semper augue. Pellentesque vel quam id metus volutpat pharetra. Nulla quis sem interdum massa varius malesuada. Suspendisse hendrerit sodales congue. ",
    publisher: "Penguin Classics",
    shelfNumber: 1,
    publicationDate: "2013",
    loanStart: "10-02-2025",
    loanEnd: "10-16-2025",
    overdue: true,
    author: { firstName: "Herman", lastName: "Hesse" },
  };
  const dummyDataH1 = {
    category: "book",
    title: "Demian",
    type: "Paperback",
    language: "English",
    genre: "Bildungsroman",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu fringilla nisi. Nullam in imperdiet eros. Praesent eget ultrices leo, ut congue orci. Mauris lorem felis, viverra quis neque ac, mollis venenatis elit. Mauris ultrices nibh nunc, ac auctor mi interdum a. Fusce lacus sem, gravida sit amet ligula mollis, molestie semper augue. Pellentesque vel quam id metus volutpat pharetra. Nulla quis sem interdum massa varius malesuada. Suspendisse hendrerit sodales congue. ",
    publisher: "Penguin Classics",
    shelfNumber: 1,
    holdStart: "10-02-2025",
    ready: false,
    publicationDate: "2013",
    author: { firstName: "Herman", lastName: "Hesse" },
  };
  const dummyDataH2 = {
    category: "book",
    title: "Demian",
    type: "Paperback",
    language: "English",
    genre: "Bildungsroman",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu fringilla nisi. Nullam in imperdiet eros. Praesent eget ultrices leo, ut congue orci. Mauris lorem felis, viverra quis neque ac, mollis venenatis elit. Mauris ultrices nibh nunc, ac auctor mi interdum a. Fusce lacus sem, gravida sit amet ligula mollis, molestie semper augue. Pellentesque vel quam id metus volutpat pharetra. Nulla quis sem interdum massa varius malesuada. Suspendisse hendrerit sodales congue. ",
    publisher: "Penguin Classics",
    shelfNumber: 1,
    holdStart: "10-02-2025",
    ready: true,
    publicationDate: "2013",
    author: { firstName: "Herman", lastName: "Hesse" },
  };
  const dummyData2 = {
    category: "periodical",
    title: "People",
    type: "Magazine",
    vol: 23,
    no: 5,
    language: "English",
    genre: "Psychological Horror",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec scelerisque vestibulum eros. Nulla et luctus libero. Praesent eget nisi volutpat, tristique neque a, volutpat tellus. Mauris at lacus eget tortor cursus lacinia eu ut turpis. Maecenas dignissim erat id sapien interdum commodo. Praesent a placerat neque. Mauris vulputate tortor vitae cursus semper. Fusce volutpat magna ut lorem lacinia consequat.",
    publisher: "People Inc",
    shelfNumber: 7,
    publicationDate: "2018",
    available: 0,
    onHold: 6,
    unavailable: 3,
  };
  const dummyData3 = {
    category: "audiovisualmedia",
    title: "Jaws",
    type: "DVD",
    runtime: 124,
    language: "English",
    genre: "Horror",
    summary:
      "Lorem ipsum dolor sit amet. Nulla et luctus libero, nec lacinia est. Praesent eget nisi volutpat, tristique neque a, volutpat tellus. Mauris at lacus eget tortor cursus lacinia eu ut turpis. Maecenas dignissim erat id sapien interdum commodo. Praesent a placerat neque. Mauris vulputate tortor vitae cursus semper. Fusce volutpat magna ut lorem lacinia consequat.",
    publisher: "Universal Home Video",
    shelfNumber: 4,
    publicationDate: "2018",
    available: 5,
    onHold: 1,
    unavailable: 3,
  };
  const dummyData4 = {
    category: "equipment",
    title: "Guitar",
    available: 0,
    onHold: 1,
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
      <h2>Tests for search view (patron)</h2>
      <Item itemData={dummyData1} />
      <Item itemData={dummyData2} />
      <Item itemData={dummyData3} />
      <Item itemData={dummyData4} />
      <h2>Tests for search view (staff)</h2>
      <h2>Tests for account view loan (patron)</h2>
      <ItemLoan itemData={dummyDataL1} />
      <ItemLoan itemData={dummyDataL2} />
      <h2>Tests for account view hold (patron)</h2>
      <ItemHold itemData={dummyDataH1} />
      <ItemHold itemData={dummyDataH2} />
    </div>
  );
}
