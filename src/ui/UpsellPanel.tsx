interface Props {
  title: string;
}

export default function UpsellPanel({
  title,
}: Props) {
  return (
    <div className="rounded-2xl border p-6">
      <h3>{title}</h3>
    </div>
  );
}
