export class FastCalendar extends Fast {
    constructor(props) {
        super();
        this.name  = 'FastCalendar';
        this.props = props;
        this.attachShadow({ mode: 'open' });
    }

    #getTemplate() {
        return `
      <div class="FastCalendar">
        <!-- Here will be the calendar when they implement it -->
      </div>
    `;
    }
}

if (!customElements.get('fast-calendar')) {
    customElements.define('fast-calendar', FastCalendar);
}