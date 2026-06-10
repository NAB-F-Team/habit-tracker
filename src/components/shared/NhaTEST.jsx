import ResponsiveHeader from "./ResponsiveHeader";
import ResponsivePageContainer from "./ResponsivePageContainer";
import SectionCard from "./SectionCard";
import StatusBadge from "./StatusBadge";

//CHỈ LÀ FILE TEST CỤA EM, KHÔNG ẢNH HƯỞNG GÌ ĐẾN DỰ ÁN Ạ, CÓ THỂ XÓA BỎ
function NhaTest() {
    return (
        <>
            <ResponsiveHeader title="Habit Tracker Pro" description="Mobile dashboard"
                actions={<button className="border border-ring rounded-md px-2 py-1">Add Habit</button>} />
            <ResponsivePageContainer />
            <SectionCard title="Hello card" description="Đây là thói quen uống nước" />
            <StatusBadge tone="danger" children="hehe" />
        </>
    );
}

export default NhaTest;
