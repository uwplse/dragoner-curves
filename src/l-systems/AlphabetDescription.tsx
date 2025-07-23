type Props = {
  alphabet: string[];
  start: string[];
  rules: [string, string[]][];
  name: string;
  stepSize: number;
  turnAngle: number;
};

export function AlphabetDescription({
  alphabet,
  name,
  start,
  rules,
  stepSize,
  turnAngle,
}: Props) {
  const commonAlphabetDescription = (ch) => {
    switch (ch) {
      case "A":
      case "B":
        return (
          <>
            <dt>{ch}</dt>
            <dd>visually and musically: do nothing</dd>
          </>
        );
      case "F":
      case "X":
      case "Y":
        return (
          <>
            <dt>{ch}</dt>
            <dd>visually: go forward by {stepSize} pixels</dd>
            <dd>musically: play note</dd>
          </>
        );
      case "Z":
        return (
          <>
            <dt>{ch}</dt>
            <dd>visually: go forward by {stepSize} pixels</dd>
            <dd>musically: play the base note of the scale</dd>
          </>
        );
      case "+":
        return (
          <>
            <dt>{ch}</dt>
            <dd>
              visually: turn right by {(turnAngle / Math.PI) * 180} degrees
            </dd>
            <dd>musically: transform note pitch one step up scale</dd>
          </>
        );
      case "-":
        return (
          <>
            <dt>{ch}</dt>
            <dd>
              visually: turn left by {(turnAngle / Math.PI) * 180} degrees
            </dd>
            <dd>musically: transform note pitch down step up scale</dd>
          </>
        );
      default:
        throw Error(`Unrecognized common alphabet char ${ch}`);
    }
  };
  return (
    <>
      <div>
        {name} Rules:
        <ul>
          <li>start: {start.join(" ")}</li>
          <li>
            for each iteration, replace each:
            <ul>
              {rules.map(([lhs, rhs]) => (
                <li>
                  {lhs} &rarr; {rhs.join(" ")}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
      <div>
        {name} Symbols:
        <dl>{alphabet.map(commonAlphabetDescription)}</dl>
      </div>
    </>
  );
}
