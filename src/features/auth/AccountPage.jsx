import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Grid, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';

// COMPONENT
import AccountReAuth from './AccountReAuth';
import AccountCompleteAuth from './AccountCompleteAuth';
import AccountChangeSuc from './AccountChangeSuc';

export default function AccountPage() {
  const { currentUser } = useSelector((state) => state.auth);
  const [authStep, setAuthstep] = useState('reauth');

  const step = useMemo(
    () => ({
      reauth: { Component: <AccountReAuth setAuthstep={setAuthstep} />, title: '본인 인증' },
      authcomplete: { Component: <AccountCompleteAuth setAuthstep={setAuthstep} />, title: '계정 업데이트' },
      authrelogin: { Component: <AccountChangeSuc />, title: '업데이트 완료' },
    }),
    []
  );

  const reAuthenticatedOrder = useCallback(
    (order, type) => {
      switch (order) {
        case 'authcomplete':
          return step[order][type];
        case 'authrelogin':
          return step[order][type];
        default:
          return step[order][type];
      }
    },
    [step]
  );

  return (
    <Grid container justify='center'>
      <Grid item xs={8}>
        <Card raised={true}>
          <CardHeader title={reAuthenticatedOrder(authStep, 'title')} />
          <CardContent>
            {currentUser?.providerId === 'password' && reAuthenticatedOrder(authStep, 'Component')}

            {currentUser?.providerId === 'google.com' && (
              <Box>
                <Typography>Google 사용자는 Google 홈페이지에서 계정 설정을 해주세요.</Typography>
                <Button
                  style={{ marginTop: 10 }}
                  startIcon={<i className='fab fa-google'></i>}
                  variant='outlined'
                  size='large'
                  component='a'
                  href='https://google.com'
                  target='_blank'
                >
                  홈페이지 이동
                </Button>
              </Box>
            )}

            {currentUser?.providerId === 'facebook.com' && (
              <Box>
                <Typography>facebook 사용자는 facebook 홈페이지에서 계정 설정을 해주세요.</Typography>
                <Button
                  style={{ marginTop: 10 }}
                  startIcon={<i className='fab fa-facebook'></i>}
                  variant='outlined'
                  size='large'
                  color='primary'
                  component='a'
                  href='https://facebook.com'
                  target='_blank'
                >
                  홈페이지 이동
                </Button>
              </Box>
            )}

            {currentUser?.providerId === 'github.com' && (
              <Box>
                <Typography>github 사용자는 github 홈페이지에서 계정 설정을 해주세요.</Typography>
                <Button
                  style={{ marginTop: 10 }}
                  startIcon={<i className='fab fa-github'></i>}
                  variant='outlined'
                  size='large'
                  color='primary'
                  component='a'
                  href='https://github.com'
                  target='_blank'
                >
                  홈페이지 이동
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
