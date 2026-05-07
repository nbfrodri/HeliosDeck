import { Toolbar } from '../components/Toolbar.jsx';
import { Deck } from '../components/Deck.jsx';
import { WidgetPicker } from '../components/WidgetPicker.jsx';

export default function Dashboard() {
  return (
    <>
      <Toolbar />
      <Deck />
      <WidgetPicker />
    </>
  );
}
