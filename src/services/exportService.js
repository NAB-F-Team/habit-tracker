import { format } from "date-fns";

export const exportData = (data) => {
  const blob = new Blob(
    [
      JSON.stringify(data, null, 2)
    ],
    {
      type: "application/json"
    }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habit-data-${format(new Date(), "yyyy-MM-dd")}.json`;
  a.click();
  URL.revokeObjectURL(url);
};