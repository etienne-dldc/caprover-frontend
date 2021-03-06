import React, { Component } from "react";
import { IAppVersion } from "../../AppDefinition";
import { Table, Icon, Tooltip, Modal } from "antd";
import { ColumnProps } from "antd/lib/table";
import ClickableLink from "../../../global/ClickableLink";
import moment from "moment";
import Utils from "../../../../utils/Utils";

export default class AppVersionTable extends Component<{
  versions: IAppVersion[];
  deployedVersion: number;
  onVersionRollbackRequested: (versionToRevert: IAppVersion) => void;
}> {
  getCols() {
    const self = this;
    const columns: ColumnProps<IAppVersion>[] = [
      {
        title: "State",
        key: "revertColumn", // arbitrary unique name for the column
        align: "center",
        dataIndex: "version" as "version",
        render: (version: number, versionDetails: IAppVersion) => {
          if (version === self.props.deployedVersion) {
            return (
              <Tooltip title="Current Version">
                <Icon
                  type="check-circle"
                  theme="twoTone"
                  twoToneColor="#52c41a"
                />
              </Tooltip>
            );
          }

          const imageName = versionDetails.deployedImageName;

          if (!imageName) {
            return (
              <Tooltip title="Failed deploy">
                <Icon type="exclamation-circle" />
              </Tooltip>
            );
          }

          return (
            <ClickableLink
              onLinkClicked={() => self.onRollbackClicked(versionDetails)}
            >
              <Tooltip title="Revert to this version">
                <span>
                  <Icon type="retweet" />
                </span>
              </Tooltip>
            </ClickableLink>
          );
        }
      },
      {
        title: "Version",
        align: "center",
        dataIndex: "version" as "version"
      },
      {
        title: "Deploy Time",
        dataIndex: "timeStamp" as "timeStamp",
        render: (timeStamp: string) => {
          return (
            <Tooltip title={moment(new Date(timeStamp)).fromNow()}>
              <span>{new Date(timeStamp).toLocaleString()}</span>
            </Tooltip>
          );
        }
      },
      {
        title: "Image Name",
        dataIndex: "deployedImageName" as "deployedImageName"
      },
      {
        title: "git hash",
        dataIndex: "gitHash" as "gitHash",
        render: (gitHashOriginal: string, versionDetails: IAppVersion) => {
          let gitHash = gitHashOriginal || "";
          if (gitHash.length > 12) {
            gitHash = gitHash.substr(0, 10) + "...";
          }
          return (
            <Tooltip title={gitHashOriginal}>
              <div className="code-input">{gitHash || "n/a"}</div>
            </Tooltip>
          );
        }
      }
    ];
    return columns;
  }

  onRollbackClicked(versionToRevert: IAppVersion) {
    const self = this;
    const imageName = versionToRevert.deployedImageName!;
    let content = (
      <span>
        {`If you had previously deleted this image explicitly through disk cleanup, 
      this revert process will fail.`}
        <br />
        <br />
        {`Do you want to continue with rolling back your app to `}
        <code>{imageName}</code>?
      </span>
    );
    if (imageName.indexOf("/") > 0) {
      content = (
        <span>
          {`${imageName} appears to be hosted on Docker Registry. 
        Make sure you have not deleted this image from the repository since it was originally deployed. 
        Deletion usually does not happen automatically, so if you have not deleted the image intentionally, 
        you don't need to worry about this.`}
          <br />
          <br />
          {`Do you want to continue with rolling back your app to `}
          <code>{imageName}</code>?
        </span>
      );
    }
    Modal.confirm({
      title: "Rollback?",
      content,
      onOk: () => {
        self.props.onVersionRollbackRequested(versionToRevert);
      }
    });
  }

  render() {
    const self = this;
    const versionsReversed = Utils.copyObject(self.props.versions).reverse();
    return (
      <div>
        <h3>Version History</h3>
        <div>
          <Table
            size="small"
            rowKey="timeStamp"
            pagination={{ pageSize: 5 }}
            columns={this.getCols()}
            dataSource={versionsReversed}
          />
        </div>
      </div>
    );
  }
}
