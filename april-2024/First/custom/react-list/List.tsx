// @ts-nocheck
import recordsApi from "REACT/common/api/record-api";
import customization from "APP/js/core/customization";
import componentManager from "APP/js/core/component-manager";
import { List } from "REACT/common/components/list/List";
import { Link } from "REACT/common/components/elements/Link";

// helper function to format date
const formatDate = (record) => {
  const date = record.date_modified;

  return date ? app.date(date).format("YYYY/MM/DD hh:mm") : "";
};

// React component that renders list of records of a specific module which is passed as a prop
const RecordList = ({ className = "react-list", module }) => {
  const { data, isLoading, isFetching, refetch } =
    recordsApi.useGetRecordsQuery({
      module,
    });

  const isInProgress = isLoading || isFetching;

  const renderListItem = (record, key) => (
    <Link
      key={key}
      className="list-item"
      to={`#${module}/${record.id}`}
      component="article"
    >
      <h3 className="list-item__name">{record.name || record.full_name}</h3>
      <h4>Modified at: {formatDate(record)}</h4>
    </Link>
  );

  return isInProgress ? (
    <div className="react-list-loading">Please wait, loading...</div>
  ) : (
    <List
      records={data?.records}
      className={className}
      renderListItem={renderListItem}
      onPullToRefresh={refetch}
    />
  );
};

// Registering RecordList component in React Component Registry under 'RecordList' name
const cmpName = "RecordList";
customization.register(RecordList, {
  reactComponentName: cmpName,
});

const ReactBridge = componentManager.getViewClass("react-container");
class ListContainer extends ReactBridge {
  initialize(options) {
    super.initialize(options);

    this.options.reactRef = cmpName;
    this.options.reactPayload = {
      module: this.module,
    };
  }
}
// Uncomment the following line to see react list in action
// customization.register(ListContainer, {
//     baseType: 'list',
// });
