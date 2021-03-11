import React from 'react';
import {
  makeStyles,
  withStyles,
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Typography,
  Button,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
} from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import { Favorite, LocationOn, FavoriteBorderOutlined, Share, MoreVert, Group } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import Prompt from '../../../app/common/dialog/Prompt';
import { useToggleClick } from '../../../app/hooks/useToggleClick';
import { useTargetClick } from '../../../app/hooks/useTargetClick';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  grid: {
    margin: theme.spacing(0, 0, 3, 0),
  },
  media: {
    minHeight: 190,
    paddingTop: '56.25%', // 16:9
  },
  showDetailEventBtn: {
    marginLeft: 'auto',
  },
  avatar: {
    backgroundColor: red[500],
  },
  eventGroupBox: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  menu: {
    '& .MuiMenu-paper': theme.palette.background.default,
  },
  location: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

export default function EventListItem() {
  const classes = useStyles();
  const [expanded, setExpanded] = useToggleClick(false);
  const [dialogOpen, setDialogOpen] = useToggleClick(false);
  const [anchorEl, setAnchorEl] = useTargetClick(null);

  function DialogClose() {
    setAnchorEl(null);
    setDialogOpen();
  }

  return (
    <Grid className={classes.grid} item xs={12}>
      <Prompt open={dialogOpen} setOpen={setDialogOpen} />
      <Card className={classes.root} raised={true}>
        <CardHeader
          avatar={
            <Avatar aria-label='recipe' className={classes.avatar}>
              R
            </Avatar>
          }
          action={
            <>
              <IconButton aria-label='settings' onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
              <StyledMenu
                className={classes.menu}
                id='event-menu'
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => setAnchorEl(null)}>수정하기</MenuItem>
                <Divider variant='fullWidth' />
                <MenuItem onClick={DialogClose}>삭제하기</MenuItem>
              </StyledMenu>
            </>
          }
          title='Shrimp and Chorizo Paella'
          subheader={
            <Typography variant='caption' color='textSecondary'>
              September 14, 2016
            </Typography>
          }
        />
        <CardMedia className={classes.media} image='/assets/categoryImages/travel.jpg' title='Paella dish' />
        <CardContent>
          <Box display='flex' alignItems='center'>
            <LocationOn />
            <Typography variant='subtitle2' color='textSecondary' display='inline'>
              서울 특별시 강남구 선릉대로 스타벅스 1호점
            </Typography>
          </Box>
          <Divider variant='fullWidth' style={{ margin: '8px 0' }} />
          <Typography variant='body1' color='textSecondary' component='p'>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quidem cumque minus tenetur vitae sint odio maxime
            error quas saepe! Odit voluptatem quas saepe blanditiis officiis perferendis, necessitatibus corporis minima
            magni!
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton aria-label='add to favorites'>
            <FavoriteBorderOutlined color='primary' />
          </IconButton>
          <IconButton aria-label='share'>
            <Share />
          </IconButton>

          <Box className={classes.showDetailEventBtn}>
            <Button color='primary' component={Link} to={`/events/detail`}>
              자세히 보기
            </Button>
            <IconButton onClick={setExpanded} aria-expanded={expanded} aria-label='show more' color='primary'>
              <Group />
            </IconButton>
          </Box>
        </CardActions>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <CardActions disableSpacing>
            <Box className={classes.eventGroupBox}>
              <Tooltip title='robot' aria-label='robot' placement='right' arrow>
                <Avatar component={Link} to='/' />
              </Tooltip>
            </Box>
          </CardActions>
        </Collapse>
      </Card>
    </Grid>
  );
}
