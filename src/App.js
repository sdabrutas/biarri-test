import React, { Fragment, useState } from 'react';
import moment from 'moment';
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import styled from '@emotion/styled';

import config from './data/config.json';
import shifts from './data/shifts.json';
import roles from './data/roles.json';
import employees from './data/employees.json';
import './App.css';

const FlexContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
`;

const StaffDetails = styled.div`
  padding: 12px 16px;
`;

const Header = styled.div`
  background: #eee;
  border-bottom: 1px solid #c6c6c6;
  text-align: center;
  padding: 10px 15px;
`;

const Role = styled(Paper)`
  background-color: ${({ bgColor }) => bgColor};
  padding: 10px 12px;
  margin: 10px 0;
  text-align: center;
`;

const App = () => {
  const [viewBy, setViewBy] = useState('calendar');
  const normalizedRoles = roles.reduce((curr, next) => {
    curr[next.id] = next;
    return curr;
  }, {});

  const normalizedEmployees = employees.reduce((curr, next) => {
    curr[next.id] = next;
    return curr;
  }, {});

  const getTimeRangeText = (startTime, endTime) => {
    return `${moment(startTime).format('DMMMYYYYHH')}-${moment(endTime).format('DMMMYYYYHH')}`;
  };

  const configuredShiftHours = shifts.map(shift => ({
    ...shift,
    start_time: new Date(shift.start_time).toLocaleString('en-US', { timeZone: config.timezone }),
    end_time: new Date(shift.end_time).toLocaleString('en-US', { timeZone: config.timezone }),
  }));

  const uniqueShifts = configuredShiftHours.reduce((result, next) => {
    const nextRangeText = getTimeRangeText(next.start_time, next.end_time);
    let copyOfResult = JSON.parse(JSON.stringify(result));
    if (nextRangeText in copyOfResult) {
      copyOfResult[nextRangeText].push(next);
    } else {
      copyOfResult[nextRangeText] = [next];
      // copyOfResult = { ...copyOfResult, [copyOfResult]: [next] };
    }
    return copyOfResult;
  }, {});

  const shiftsByEmployee = configuredShiftHours.reduce((curr, next) => {
    if (next.employee_id in curr) {
      curr[next.employee_id].push(next);
    } else {
      curr[next.employee_id] = [next];
    }
    return curr;
  }, {});

  const renderCalendarView = () => (
    <FlexContainer>
      {Object.keys(uniqueShifts).map(key => {
        const shifts = uniqueShifts[key];
        const startTime = moment(shifts[0].start_time).format('D MMM YYYY HH:mm');
        const endTime = moment(shifts[0].end_time).format('D MMM YYYY HH:mm');
        return (
          <Paper key={key} elevation={2} sx={{ width: '360px'}}>
            <Header>
              <Typography variant="h6" component="p">{startTime}</Typography>
              <Typography variant="h6" component="p">- {endTime}</Typography>
            </Header>
            <StaffDetails>
              {shifts.map(shift => (
                <Role key={shift.id} bgColor={normalizedRoles[shift.role_id].background_colour}>
                  <Typography variant="subtitle2" component="span">{normalizedRoles[shift.role_id].name}</Typography>
                  <Typography variant="h6" component="p">
                    {normalizedEmployees[shift.employee_id].first_name} {normalizedEmployees[shift.employee_id].last_name}
                  </Typography>
                </Role>
              ))}
            </StaffDetails>
          </Paper>
        );
      })}
    </FlexContainer>
  );

  const renderEmployeeView = () => employees.map(({ id, first_name, last_name }) => {
    return (
      <Fragment key={id}>
        <Typography variant="h4">{`${first_name} ${last_name}`}</Typography>
        <FlexContainer>
          {shiftsByEmployee[id].map(shift => {
            const startTime = moment(shift.start_time).format('D MMM YYYY HH:mm');
            const endTime = moment(shift.end_time).format('D MMM YYYY HH:mm');
            return (
              <Paper key={shift.id} elevation={2} sx={{ width: '360px'}}>
                <Header>
                  <Typography variant="h6" component="p">{startTime}</Typography>
                  <Typography variant="h6" component="p">- {endTime}</Typography>
                </Header>
                <StaffDetails>
                  <Role bgColor={normalizedRoles[shift.role_id].background_colour}>
                    <Typography variant="subtitle2" component="span">{normalizedRoles[shift.role_id].name}</Typography>
                  </Role>
                </StaffDetails>
              </Paper>
            );
          })}
        </FlexContainer>
      </Fragment>
    );
  });

  return (
    <div className="App">
      <Container sx={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div>
          <FormControl sx={{ width: '300px' }}>
            <InputLabel id="view-by-label">View By</InputLabel>
            <Select
              labelId="view-by-label"
              id="view-by"
              value={viewBy}
              label="View by"
              onChange={e => setViewBy(e.target.value)}
            >
              <MenuItem value="calendar">Calendar</MenuItem>
              <MenuItem value="employee">Employee Schedule</MenuItem>
            </Select>
          </FormControl>
        </div>
        {viewBy === 'calendar'
          ? renderCalendarView()
          : renderEmployeeView()
        }
      </Container>
    </div>
  );
};

export default App;
