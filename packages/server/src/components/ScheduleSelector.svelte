<script>
  import { onMount } from "svelte";
  import { ResourceSchedule, Time } from "@upswyng/common";
  import { RRule } from "rrule";
  import moment from "moment-timezone";
  import ScheduleItem from "./ScheduleSelectorScheduleItem.svelte";
  import Select from "svelte-select";

  const { tz } = moment;

  export let value; // TResourceSchedule

  let recurrenceText = "";
  let isCommentExpanded = false;

  // Run once mounted so this logic is executed on the user's machine
  // instead of on our server.
  onMount(() => {
    // If the resource is not always open and it doesn't have a timezone zet,
    // try to guess it.
    if (!value.timezone && !value.alwaysOpen) {
      const timezoneGuess = tz.guess();
      tz.zone(timezoneGuess) && (value.timezone = timezoneGuess);
      value = value;
    }
  });

  function createRecurrenceRule(weeklyRepeatState, certainWeekRepeatState) {
    const dayToCode = {
      sunday: "SU",
      monday: "MO",
      tuesday: "TU",
      wednesday: "WE",
      thursday: "TH",
      friday: "FR",
      saturday: "SA",
    };

    if (Object.keys(dayToCode).every(d => !weeklyRepeatState[d])) {
      throw new Error("Please select at least one day");
    }

    const options = {
      freq: certainWeekRepeatState.everyWeek ? RRule.WEEKLY : RRule.MONTHLY,

      byweekday: Object.keys(dayToCode)
        .map(d => (weeklyRepeatState[d] ? RRule[dayToCode[d]] : null))
        .filter(Boolean)
        .map(dayEnum => {
          if (certainWeekRepeatState.everyWeek) {
            return dayEnum;
          } else {
            return Object.entries(certainWeekRepeatState)
              .filter(([k, v]) => v && k !== "everyWeek")
              .map(([k, _v]) => dayEnum["nth"](k));
          }
        })
        .flat(),
    };
    if (certainWeekRepeatState.everyWeek) {
      options.interval = 1;
    }
    return new RRule(options);
  }

  function addWeeklyRecurrence() {
    if (!weeklyRepeatState.fromTime || !weeklyRepeatState.toTime) {
      throw new Error("Please enter a 'from' and 'to' time");
    }

    const fromIndex = Time.options
      .map(o => o.label)
      .indexOf(weeklyRepeatState.fromTime.label);
    const toIndex = Time.options
      .map(o => o.label)
      .indexOf(weeklyRepeatState.toTime.label);
    if (fromIndex < 0) {
      throw new Error("The 'from' time is not valid");
    }
    if (toIndex < 0) {
      throw new Error("The 'to' time is not valid");
    }
    if (fromIndex >= toIndex) {
      throw new Error(
        `The 'from' time (${weeklyRepeatState.fromTime.label}) must come before the 'to' time (${weeklyRepeatState.toTime.label})`
      );
    }

    const rrule = createRecurrenceRule(
      weeklyRepeatState,
      certainWeekRepeatState
    );

    value.addItem({
      recurrenceRule: rrule,
      comment: weeklyRepeatState.comment || "",
      fromTime: weeklyRepeatState.fromTime,
      toTime: weeklyRepeatState.toTime,
    });

    weeklyRepeatState = Object.assign({}, weeklyRepeatStateDefault);
    certainWeekRepeatState = Object.assign({}, certainWeekRepeatStateDefault);
    value = value; // make svelte update itself
  }

  const weeklyRepeatStateDefault = {
    comment: "",
    error: "",
    everyDay: false,
    sunday: false,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    fromTime: null,
    toTime: null,
  };

  const certainWeekRepeatStateDefault = {
    everyWeek: true,
    1: false, // first <sunday, monday, ... saturday> of month
    2: false, // second of month
    3: false,
    4: false,
    [-2]: false, // second to last of month
    [-1]: false, // last of month,
  };

  let weeklyRepeatState = Object.assign({}, weeklyRepeatStateDefault);
  let certainWeekRepeatState = Object.assign({}, certainWeekRepeatStateDefault);

  $: {
    try {
      recurrenceText = createRecurrenceRule(
        weeklyRepeatState,
        certainWeekRepeatState
      ).toText();
    } catch (_e) {
      recurrenceText = "";
    }
  }
</script>

<style>
  ul {
    list-style: none;
    margin-left: 0;
  }

  .more-less-selector {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .more-less-selector a {
    cursor: pointer;
    text-decoration: none;
  }

  .more-less-selector a span.icon {
    position: relative;
    top: 0.1em;
    left: 0.15em;
  }
</style>

<h1 class="subtitle is-size-4">Schedule</h1>

<div class="content">
  <fieldset>
    <div class="field">
      <input
        id="always-open"
        class="switch is-medium is-primary"
        name="always-open"
        bind:checked={value.alwaysOpen}
        type="checkbox" />
      <label class="label" for="always-open">Always Open</label>
    </div>
  </fieldset>
</div>
<div class="content">
  <div class="columns">
    <div class="column is-one-fifth">
      <fieldset>
        <label class="label" for="timezone">Timezone</label>
        <Select
          isClearable={false}
          items={tz
            .names()
            .map(z => ({ label: z.replace(/_/g, ' '), value: z }))}
          on:select={({ detail: tz }) => {
            value.timezone = tz.value;
            value = value;
          }}
          selectedValue={value.timezone ? { label: value.timezone.replace(/_/g, ' '), value: value.timezone } : null} />
      </fieldset>
    </div>
  </div>
</div>
<h2 class="subtitle is-size-5">Hours of Operation</h2>
<div class="content">
  <ul>
    {#each value.getItems() as scheduleItem, _i (JSON.stringify(scheduleItem))}
      <ScheduleItem
        item={scheduleItem}
        showDeleteAction={true}
        on:delete={({ detail: item }) => {
          value.removeItem(item);
          value = value;
        }} />
    {/each}
  </ul>
</div>
<div class="box">
  <h2 class="subtitle is-size-5">Add Hours of Operation</h2>
  <div class="content">
    <fieldset>
      <div class="field has-addons">
        <p class="control is-hidden-mobile">
          <button
            aria-label="Every Day"
            class="button"
            class:is-primary={weeklyRepeatState.everyDay}
            on:click|preventDefault={() => {
              weeklyRepeatState = { ...weeklyRepeatState, everyDay: true, sunday: true, monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true };
            }}
            title="Select every day">
            <span>Every Day</span>
          </button>
        </p>
        {#each ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as day}
          <p class="control">
            <button
              aria-label={day}
              class="button"
              class:is-primary={weeklyRepeatState[day.toLowerCase()]}
              on:click|preventDefault={() => {
                weeklyRepeatState = { ...weeklyRepeatState, everyDay: false, [day.toLowerCase()]: !weeklyRepeatState[day.toLowerCase()] };
              }}>
              <span class="is-hidden-mobile">{day}</span>
              <span class="is-hidden-tablet">{day.slice(0, 2)}</span>
            </button>
          </p>
        {/each}
        <button
          aria-label="Clear Schedule"
          class="button"
          on:click|preventDefault={() => {
            weeklyRepeatState = { ...weeklyRepeatStateDefault, fromTime: weeklyRepeatState.fromTime, toTime: weeklyRepeatState.toTime, comment: weeklyRepeatState.comment, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false };
          }}
          title="Clear all days">
          <span class="icon is-small">
            <i class="fas fa-times" aria-hidden="true" />
          </span>
        </button>
      </div>
      <div class="columns">
        <div class="column is-one-fifth">
          <label class="label" for="from-time">From</label>
          <Select
            bind:selectedValue={weeklyRepeatState.fromTime}
            items={Time.options.filter(o => !o.isNextDay)} />
        </div>
        <div class="column is-one-fifth">
          <label class="label" for="to-time">To</label>
          <Select
            bind:selectedValue={weeklyRepeatState.toTime}
            items={Time.options} />
        </div>
      </div>

      <div class="control field">
        <span class="label" id="day-repeat">These day(s) repeat</span>
        <label class="radio" aria-describedby="day-repeat">
          <input
            type="radio"
            name="repeats"
            checked={certainWeekRepeatState.everyWeek}
            on:click={() => {
              certainWeekRepeatState = { ...certainWeekRepeatStateDefault };
            }} />
          weekly
        </label>
        <label class="radio" aria-describedby="day-repeat">
          <input
            type="radio"
            name="repeats"
            checked={!certainWeekRepeatState.everyWeek}
            on:click={() => {
              certainWeekRepeatState = { ...certainWeekRepeatState, everyWeek: false, [1]: true };
            }} />
          monthly
        </label>
      </div>
      {#if !certainWeekRepeatState.everyWeek}
        <div class="field">
          <label class="label">These day(s) repeat every month on their</label>
          <div class="control">
            <div class="buttons has-addons">
              {#each [{ name: 'first occurrence', value: 1 }, { name: 'second occurrence', value: 2 }, { name: 'third occurrence', value: 3 }, { name: 'fourth occurrence', value: 4 }, { name: 'last occurrence', value: -1 }, { name: 'second-to-last occurrence', value: -2 }] as entry}
                <button
                  class="button is-marginless"
                  class:is-primary={certainWeekRepeatState[entry.value]}
                  on:click|preventDefault={() => {
                    certainWeekRepeatState = { ...certainWeekRepeatState, everyWeek: false, [entry.value]: !certainWeekRepeatState[entry.value] };
                  }}>
                  <span>{entry.name}</span>
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}
      {#if recurrenceText.length}
        <div class="box">
          {recurrenceText.charAt(0).toUpperCase() + recurrenceText.slice(1)}
          {#if weeklyRepeatState.fromTime && weeklyRepeatState.toTime}
            from {weeklyRepeatState.fromTime.label} to {weeklyRepeatState.toTime.label}
          {:else}
            <span class="has-text-grey is-italic">&lt;select times&gt;</span>
          {/if}
        </div>
      {/if}
      {#if weeklyRepeatState.fromTime && weeklyRepeatState.toTime && parseInt(weeklyRepeatState.fromTime.value, 10) >= parseInt(weeklyRepeatState.toTime.value, 10)}
        <p class="notification is-warning">
          The 'From' time must be before the 'To' time.
        </p>
      {/if}
      <p>
        <label
          class="label"
          for="comment"
          aria-expanded={isCommentExpanded}
          aria-controls="comment"
          on:click={() => (isCommentExpanded = !isCommentExpanded)}>
          Comment (optional)
          {#if !isCommentExpanded}
            <span>
              <i class="fas fa-chevron-right" aria-hidden="true" />
            </span>
          {:else}
            <span>
              <i class="fas fa-chevron-down" aria-hidden="true" />
            </span>
          {/if}
        </label>
        {#if isCommentExpanded}
          <textarea
            bind:value={weeklyRepeatState.comment}
            class="textarea"
            name="comment"
            id="comment"
            placeholder="ex: Open only for residents"
            rows="3" />
        {/if}
      </p>
      <button
        class="button is-primary"
        disabled={!weeklyRepeatState.fromTime || !weeklyRepeatState.toTime || parseInt(weeklyRepeatState.fromTime.value, 10) >= parseInt(weeklyRepeatState.toTime.value, 10)}
        type="button"
        preventDefault
        on:click={() => {
          weeklyRepeatState.error = '';
          try {
            addWeeklyRecurrence();
          } catch (e) {
            weeklyRepeatState.error = e.message;
          }
        }}>
        Update Schedule
      </button>
    </fieldset>
  </div>
</div>
{#if weeklyRepeatState.error}
  <div class="content">
    <div class="notification is-danger">
      <button class="delete" on:click={() => (weeklyRepeatState.error = '')} />
      {weeklyRepeatState.error}
    </div>
  </div>
{/if}
