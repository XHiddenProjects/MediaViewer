import { startup, BeforeAndAfter} from "../js/mediaviewer.js";
startup();
new BeforeAndAfter('[media-before-after]', {
    before: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    after: 'https://images.pexels.com/photos/3728078/pexels-photo-3728078.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    orientation: 'horizontal', // 'horizontal' or 'vertical'
    handleStyle: {
        width: '3px', // Thickness of the dividing line
        knobSize: '30px', // Size of the draggable knob
        iconColor: '#ccc' // Color of the icon on the knob
    },
});