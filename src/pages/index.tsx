import { Seo } from "../components/Seo";
import { seo } from "../seo";
import Demo from "../fleet/Demo";
export default function Index() {
  return (
    <>
      <Seo {...seo} path="/" />
      <Demo />
    </>
  );
}
